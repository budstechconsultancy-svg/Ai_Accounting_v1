#!/usr/bin/env python
"""
AI Worker Management Script

This script manages RQ workers for processing AI requests with autoscaling support.

Usage:
    python manage_workers.py start <num_workers>  # Start workers
    python manage_workers.py stop                    # Stop all workers
    python manage_workers.py status                 # Show worker status
    python manage_workers.py scale <target_workers> # Scale to target number

Environment Variables:
    REDIS_URL: Redis connection URL
    WORKER_CONCURRENCY: Number of concurrent jobs per worker (default: 2)
    WORKER_QUEUES: Comma-separated queue names (default: ai_queue)
"""

import os
import sys
import signal
import time
import logging
from multiprocessing import Process
import psutil
from django.core.management.base import BaseCommand
from django_rq import get_worker
import redis

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WorkerManager:
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/0')
        self.redis_client = redis.from_url(self.redis_url)
        self.concurrency = int(os.getenv('WORKER_CONCURRENCY', '2'))
        self.queues = os.getenv('WORKER_QUEUES', 'ai_queue').split(',')
        self.worker_processes = []

    def start_worker(self, worker_id: str):
        """Start a single RQ worker process"""
        def worker_process():
            try:
                logger.info(f"Starting worker {worker_id} with concurrency {self.concurrency}")
                worker = get_worker(self.queues, name=worker_id)
                worker.work()
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}")
            finally:
                logger.info(f"Worker {worker_id} stopped")

        process = Process(target=worker_process, name=f"ai_worker_{worker_id}")
        process.daemon = True
        process.start()
        self.worker_processes.append((worker_id, process))
        logger.info(f"Started worker {worker_id} (PID: {process.pid})")

    def start_workers(self, num_workers: int):
        """Start multiple workers"""
        self.stop_workers()  # Clean up any existing workers

        for i in range(num_workers):
            worker_id = f"worker_{i+1}"
            self.start_worker(worker_id)
            time.sleep(0.5)  # Stagger startup

        self.redis_client.set('active_workers', num_workers)
        logger.info(f"Started {num_workers} workers")

    def stop_workers(self):
        """Stop all managed workers"""
        for worker_id, process in self.worker_processes:
            try:
                if process.is_alive():
                    process.terminate()
                    process.join(timeout=5)
                    if process.is_alive():
                        process.kill()
                    logger.info(f"Stopped worker {worker_id}")
            except Exception as e:
                logger.error(f"Error stopping worker {worker_id}: {e}")

        self.worker_processes.clear()
        self.redis_client.delete('active_workers')

    def get_worker_status(self):
        """Get status of all workers and queues"""
        try:
            # Get queue info
            ai_queue = get_worker(['ai_queue']).queues[0] if self.queues else None
            queue_size = ai_queue.count if ai_queue else 0

            # Get worker count
            active_workers = self.redis_client.get('active_workers')
            active_workers = int(active_workers) if active_workers else 0

            # Get system info
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            memory_percent = memory.percent

            return {
                'active_workers': active_workers,
                'queue_size': queue_size,
                'cpu_percent': cpu_percent,
                'memory_percent': memory_percent,
                'worker_processes': [
                    {
                        'id': worker_id,
                        'pid': process.pid,
                        'alive': process.is_alive(),
                        'cpu_percent': psutil.Process(process.pid).cpu_percent() if process.is_alive() else 0
                    }
                    for worker_id, process in self.worker_processes
                ]
            }
        except Exception as e:
            logger.error(f"Error getting worker status: {e}")
            return {'error': str(e)}

    def autoscale_workers(self):
        """Automatically scale workers based on queue depth and system load"""
        status = self.get_worker_status()
        queue_size = status.get('queue_size', 0)
        active_workers = status.get('active_workers', 0)
        cpu_percent = status.get('cpu_percent', 0)

        # Autoscaling logic
        min_workers = int(os.getenv('MIN_WORKERS', '1'))
        max_workers = int(os.getenv('MAX_WORKERS', '10'))

        # Scale up if queue is growing or high CPU
        target_workers = active_workers
        if queue_size > active_workers * 5:  # More than 5 jobs per worker in queue
            target_workers = min(max_workers, active_workers + 2)
        elif queue_size > active_workers * 2:
            target_workers = min(max_workers, active_workers + 1)
        elif cpu_percent > 80 and active_workers < max_workers:
            target_workers = min(max_workers, active_workers + 1)

        # Scale down if queue is small and low CPU
        elif queue_size < 2 and cpu_percent < 60 and active_workers > min_workers:
            target_workers = max(min_workers, active_workers - 1)

        if target_workers != active_workers:
            logger.info(f"Autoscaling from {active_workers} to {target_workers} workers")
            self.start_workers(target_workers)

        return target_workers

def main():
    if len(sys.argv) < 2:
        print("Usage: python manage_workers.py <command> [args]")
        print("Commands: start <num>, stop, status, scale <num>, autoscale")
        sys.exit(1)

    command = sys.argv[1]
    manager = WorkerManager()

    def signal_handler(signum, frame):
        logger.info("Received shutdown signal, stopping workers...")
        manager.stop_workers()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        if command == 'start':
            if len(sys.argv) < 3:
                print("Usage: python manage_workers.py start <num_workers>")
                sys.exit(1)
            num_workers = int(sys.argv[2])
            manager.start_workers(num_workers)

            # Keep running
            while True:
                time.sleep(60)
                manager.autoscale_workers()

        elif command == 'stop':
            manager.stop_workers()

        elif command == 'status':
            status = manager.get_worker_status()
            import json
            print(json.dumps(status, indent=2))

        elif command == 'scale':
            if len(sys.argv) < 3:
                print("Usage: python manage_workers.py scale <target_workers>")
                sys.exit(1)
            target = int(sys.argv[2])
            manager.start_workers(target)

        elif command == 'autoscale':
            while True:
                target = manager.autoscale_workers()
                time.sleep(30)  # Check every 30 seconds

        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Interrupted, shutting down...")
        manager.stop_workers()

if __name__ == '__main__':
    # Add the backend directory to Python path
    sys.path.insert(0, os.path.dirname(__file__) or '.')

    # Configure Django
    import django
    from backend.settings import *  # noqa
    django.setup()

    main()

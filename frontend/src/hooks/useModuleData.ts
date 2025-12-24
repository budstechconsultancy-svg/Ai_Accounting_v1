import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services';
import type { UserTable, RoleModulesData } from '../types';

// Simple in-memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new SimpleCache();

export const useModuleData = () => {
  const [userTables, setUserTables] = useState<UserTable[]>([]);
  const [userTablesLoading, setUserTablesLoading] = useState(false);
  const [userTablesError, setUserTablesError] = useState<Error | null>(null);

  const loadUserTables = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'user-tables';

    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<UserTable[]>(cacheKey);
      if (cached) {
        setUserTables(cached);
        return cached;
      }
    }

    setUserTablesLoading(true);
    setUserTablesError(null);

    try {
      const data = await apiService.getUserTables();
      setUserTables(data);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load user tables');
      setUserTablesError(err);
      throw err;
    } finally {
      setUserTablesLoading(false);
    }
  }, []);

  // Load user tables on mount
  useEffect(() => {
    loadUserTables();
  }, [loadUserTables]);

  return {
    userTables,
    userTablesLoading,
    userTablesError,
    loadUserTables,
    invalidateUserTablesCache: () => cache.invalidate('user-tables')
  };
};

export const useRoleModules = (roleId?: number) => {
  const [roleModules, setRoleModules] = useState<number[]>([]);
  const [roleModulesLoading, setRoleModulesLoading] = useState(false);
  const [roleModulesError, setRoleModulesError] = useState<Error | null>(null);

  const loadRoleModules = useCallback(async (forceRefresh = false) => {
    if (!roleId) return;

    const cacheKey = `role-modules-${roleId}`;

    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<number[]>(cacheKey);
      if (cached) {
        setRoleModules(cached);
        return cached;
      }
    }

    setRoleModulesLoading(true);
    setRoleModulesError(null);

    try {
      const data = await apiService.getRoleModules(roleId);
      setRoleModules(data.selectedSubmoduleIds);
      cache.set(cacheKey, data.selectedSubmoduleIds);
      return data.selectedSubmoduleIds;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load role modules');
      setRoleModulesError(err);
      throw err;
    } finally {
      setRoleModulesLoading(false);
    }
  }, [roleId]);

  const saveRoleModules = useCallback(async (selectedIds: number[]) => {
    if (!roleId) return;

    try {
      await apiService.saveRoleModules(roleId, selectedIds);
      // Update local state
      setRoleModules(selectedIds);
      // Invalidate cache for this role
      cache.invalidate(`role-modules-${roleId}`);
      // Invalidate any related caches if needed
      return selectedIds;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to save role modules');
      setRoleModulesError(err);
      throw err;
    }
  }, [roleId]);

  // Load role modules when roleId changes
  useEffect(() => {
    if (roleId) {
      loadRoleModules();
    } else {
      setRoleModules([]);
    }
  }, [roleId, loadRoleModules]);

  return {
    selectedSubmoduleIds: roleModules,
    roleModulesLoading,
    roleModulesError,
    loadRoleModules,
    saveRoleModules,
    invalidateRoleModulesCache: () => cache.invalidate(`role-modules-${roleId}`)
  };
};

// Utility hook that combines both
export const useModuleDataComplete = (roleId: number) => {
  const userTablesData = useModuleData();
  const roleModulesData = useRoleModules(roleId);

  return {
    ...userTablesData,
    ...roleModulesData,
    isLoading: userTablesData.userTablesLoading || roleModulesData.roleModulesLoading,
    hasError: !!(userTablesData.userTablesError || roleModulesData.roleModulesError)
  };
};

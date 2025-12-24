from django.test import TestCase
from unittest.mock import patch, MagicMock
from django.core.files.uploadedfile import SimpleUploadedFile
from core.ai_service import create_invoice_processing_request
from core.ai_proxy import ai_service
import base64

class GeminiInvoiceTest(TestCase):
    @patch('core.ai_proxy.genai')
    @patch('core.ai_proxy.redis') 
    @patch('core.ai_proxy.api_key_manager')
    def test_invoice_extraction_flow(self, mock_api_key_mgr, mock_redis, mock_genai):
        # Setup mock for API Key Manager
        mock_api_key_mgr.get_healthy_key.return_value = "fake_api_key"

        # Setup mock for GenAI
        # Setup mock for GenAI
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"invoiceNumber": "INV-123"}'
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model
        
        # Setup mock for Redis
        mock_redis_client = MagicMock()
        mock_redis.from_url.return_value = mock_redis_client
        mock_redis_client.ping.return_value = True
        
        # Force direct processing by disabling queue
        # We need to modify the global instance
        ai_service.queue_available = False
        
        # Create dummy image
        image_content = b"fake_image_content"
        image_file = SimpleUploadedFile("test.jpg", image_content, content_type="image/jpeg")
        
        # Call the service
        # This calls ai_service.make_request -> process_ai_request (direct path)
        result = create_invoice_processing_request(
            image_file, 
            user_id="user1", 
            tenant_id="tenant1"
        )
        
        # Verify result
        if 'error' in result:
             self.fail(f"Request failed with error: {result['error']}")

        self.assertIn('reply', result)
        self.assertEqual(result['reply'], '{"invoiceNumber": "INV-123"}')
        
        # Verify genai was called with list (multimodal input)
        args, kwargs = mock_model.generate_content.call_args
        prompt_arg = args[0]
        
        self.assertIsInstance(prompt_arg, list)
        self.assertEqual(len(prompt_arg), 2)
        self.assertIsInstance(prompt_arg[0], str) # Text prompt
        self.assertIsInstance(prompt_arg[1], dict) # Image part
        self.assertEqual(prompt_arg[1]['mime_type'], 'image/jpeg')
        self.assertEqual(prompt_arg[1]['data'], image_content)

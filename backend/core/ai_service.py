
import os
import json
import logging
import hashlib
import base64
from django.core.files.uploadedfile import UploadedFile

logger = logging.getLogger(__name__)


def extract_invoice_data(image_file: UploadedFile, mime_type='image/jpeg'):
    """
    Extracts structured invoice data from an image using the AI proxy system.
    Returns a dictionary compatible with the existing format.
    """
    try:
        # Read and encode file content
        image_content = image_file.read()
        # For small files, convert to base64. For large files, might need to upload to Gemini first

        # Calculate file hash for caching
        file_hash = hashlib.md5(image_content).hexdigest()

        # Build enhanced prompt with file data
        prompt = f"""
        You are an expert accounting AI. Extract the following invoice details from the attached image into a strict JSON format:

        {{
            "invoiceNumber": "string",
            "invoiceDate": "YYYY-MM-DD",
            "dueDate": "YYYY-MM-DD",
            "sellerName": "string",
            "sellerGSTIN": "string",
            "buyerName": "string",
            "buyerGSTIN": "string",
            "totalAmount": number,
            "totalTax": number,
            "lineItems": [
                {{
                    "itemDescription": "string",
                    "quantity": number,
                    "rate": number,
                    "amount": number
                }}
            ],
            "narration": "Brief summary of the invoice"
        }}

        Do not include markdown formatting (```json), just the raw JSON. If a date is missing, use today's date.

        Important: Return ONLY the JSON object, no additional text.
        """

        # For now, create a text-based request since the file handling in proxy is text-only
        # In a full implementation, we'd pass image data through the queue
        request_data = {
            'prompt': prompt,
            # Note: File data would be passed differently in a production system
            'file_hash': file_hash
        }

        # This function is called directly, but we should route through proxy
        # For backward compatibility, we'll return an error asking to use proxy
        return {"error": "Invoice processing now requires user authentication, use API endpoint instead"}

    except Exception as e:
        logger.exception("Error preparing invoice data for AI processing")
        return {"error": str(e)}


def create_invoice_processing_request(image_file: UploadedFile, mime_type='image/jpeg', user_id='', tenant_id='') -> dict:
    """
    Creates a properly formatted request for invoice processing through the AI proxy
    """
    try:
        # Read file content
        image_content = image_file.read()

        # Calculate file hash for deduplication
        file_hash = hashlib.md5(image_content).hexdigest()

        # Encode image for text-based queuing (workaround - proper implementation would handle files)
        # In production, files might be stored temporarily and referenced
        image_b64 = base64.b64encode(image_content).decode('utf-8')

        prompt = """
        Extract invoice data from this image and return as a JSON ARRAY containing a SINGLE object representing the entire invoice.
        
        DO NOT create multiple objects for line items - consolidate all line items into arrays within a single invoice object.
        
        Use exactly these keys (if available):
        "Voucher Date" (Format YYYY-MM-DD)
        "Invoice Number"
        "Supplier Name"
        "Supplier Address - Bill from"
        "GSTIN"
        "PAN"
        "Item/Description" (comma-separated list of all items, or just the main item if single)
        "Quantity" (total quantity or main item quantity)
        "Item Rate" (average rate or main item rate)
        "Item Amount" (total amount for all items)
        "HSN/SAC Details" (comma-separated if multiple, or single value)
        "Taxable Value" (total taxable value)
        "IGST Amount" (total IGST)
        "CGST Amount" (total CGST)
        "SGST/UTGST Amount" (total SGST/UTGST)
        "Invoice Value" (total invoice amount)
        "Bank - Bank Name"
        "Bank - A/c No."
        "Bank - IFS Code"
        "Bank - Branch"
        "Party Type" (Deduce if 'Vendor' or 'Customer' based on the document)
        "Party Name" (Same as Supplier Name for purchases, or Buyer Name for sales)
        "Party ID" (Extract if available)
        "Paid Amount" (If payment proof is visible)
        "Paid Date" (If payment proof is visible, YYYY-MM-DD)
        "Payment Mode" (e.g. Cash, Bank, UPI etc. if visible)
        "Payment Reference No" (e.g. UTR number if visible)
        "e-Way Bill No." (If visible)
        "Motor Vehicle No." (If visible)
        "State" (Place of Supply)
        "Email" (Contact Email)

        IMPORTANT: Return a JSON array with exactly ONE object per invoice. Do not duplicate the invoice data.
        Example format: [{"Invoice Number": "INV001", "Supplier Name": "ABC Corp", ...}]
        
        Return ONLY the JSON array. Do not include markdown formatting.
        """

        request_data = {
            'prompt': prompt,
            'file_hash': file_hash,
            'mime_type': mime_type,
            'image_data': image_b64  # Pass full image data
        }

        # Import here to avoid circular imports
        from .ai_proxy import ai_service

        return ai_service.make_request('invoice', request_data, user_id, tenant_id)

    except Exception as e:
        logger.exception("Error creating invoice processing request")
        return {"error": str(e)}

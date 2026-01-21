import os
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def validate_key(api_key, label="Current Key"):
    if not api_key:
        print(f"❌ {label}: No key provided.")
        return

    print(f"🔍 Testing {label}: {api_key[:5]}...")
    genai.configure(api_key=api_key)
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Try to generate content
        response = model.generate_content("Reply with 'OK'")
        print(f"✅ {label}: VALID! (Response: {response.text.strip()})")
        return True
    except exceptions.ResourceExhausted:
         print(f"⚠️  {label}: VALID but RATE LIMITED (Quota Exceeded). Good for testing with retry logic.")
         return True # It is valid, just limited
    except exceptions.PermissionDenied: # 403
         print(f"❌ {label}: DISABLED or PERMISSION DENIED (403). Cannot be used.")
         return False
    except Exception as e:
        print(f"❌ {label}: FAILED - {str(e)}")
        return False

if __name__ == "__main__":
    current_key = os.getenv('GEMINI_API_KEY')
    
    print("--- API Key Validation ---")
    if validate_key(current_key, "Current .env Key"):
        print("\n✅ Current key is usable (maybe limited).")
    else:
        print("\n❌ Current key is NOT usable.")
        print("\nACTION REQUIRED:")
        print("1. ENABLE the API for this key at the link provided in the error.")
        print("   OR")
        print("2. CHANGE the key in backend/.env to a valid one.")
        print("   (If you have the old key starting with AIzaSyDXI..., it was rate-limited but working. You can switch back to it.)")


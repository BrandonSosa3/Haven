from services.plaid_service import create_link_token

# Test creating a link token
try:
    response = create_link_token(user_id="test_user_123")
    print("✅ Plaid connection successful!")
    print(f"Link token: {response['link_token'][:50]}...")
    print(f"Expires at: {response['expiration']}")
except Exception as e:
    print(f"❌ Plaid connection failed: {e}")
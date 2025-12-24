import requests

# Your auth token
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZDQ0NzU0Yy1kOTBlLTQyNDYtODAzMy1lZmY0ODY1ZTZjYzUiLCJleHAiOjE3NjY1MTkyOTJ9.kTbSbe9J2-h8GJeeB6YJC7SmGxgVmZ0HLl5HghDT2u4"  # Replace with actual token

# Base URL
BASE_URL = "http://127.0.0.1:8000"

print("Step 1: Creating link token...")
response = requests.post(
    f"{BASE_URL}/plaid/create_link_token",
    headers={"Authorization": f"Bearer {AUTH_TOKEN}"}
)
link_token = response.json()["link_token"]
print(f"✅ Link token created: {link_token[:50]}...")

print("\nStep 2: Simulating Plaid Link (in real app, user would do this in UI)")
print("In sandbox, you would:")
print("1. Open Plaid Link with the link_token")
print("2. Select 'First Platypus Bank' (test bank)")
print("3. Use credentials: user_good / pass_good")
print("4. Select accounts to connect")
print("5. Get back a public_token")
print("\nFor now, we need the frontend to complete this flow.")
print("\n✅ Backend is ready for Plaid integration!")
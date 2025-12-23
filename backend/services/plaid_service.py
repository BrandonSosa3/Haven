import plaid
from plaid.api import plaid_api
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.development')

# Plaid configuration
PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')

# Map environment to Plaid host
# Map environment to Plaid host
PLAID_HOST_MAP = {
    'sandbox': plaid.Environment.Sandbox,
    'development': plaid.Environment.Development,
    'production': plaid.Environment.Production
}

# Fallback if using older plaid-python version
if not hasattr(plaid.Environment, 'Development'):
    PLAID_HOST_MAP = {
        'sandbox': plaid.Environment.Sandbox,
        'development': plaid.Environment.Sandbox,  # Use sandbox for dev
        'production': plaid.Environment.Production
    }

# Create Plaid configuration
configuration = plaid.Configuration(
    host=PLAID_HOST_MAP[PLAID_ENV],
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
    }
)

# Create API client
api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)


def create_link_token(user_id: str):
    """Create a link token for Plaid Link"""
    try:
        request = LinkTokenCreateRequest(
            products=[Products("auth"), Products("transactions")],
            client_name="Haven",
            country_codes=[CountryCode('US')],
            language='en',
            user=LinkTokenCreateRequestUser(
                client_user_id=user_id
            )
        )
        response = client.link_token_create(request)
        return response.to_dict()
    except plaid.ApiException as e:
        print(f"Error creating link token: {e}")
        raise


def exchange_public_token(public_token: str):
    """Exchange public token for access token"""
    try:
        request = ItemPublicTokenExchangeRequest(
            public_token=public_token
        )
        response = client.item_public_token_exchange(request)
        return response.to_dict()
    except plaid.ApiException as e:
        print(f"Error exchanging token: {e}")
        raise

def get_accounts(access_token: str):
    """Get accounts for a given access token"""
    try:
        request = AccountsGetRequest(
            access_token=access_token
        )
        response = client.accounts_get(request)
        return response.to_dict()
    except plaid.ApiException as e:
        print(f"Error getting accounts: {e}")
        raise
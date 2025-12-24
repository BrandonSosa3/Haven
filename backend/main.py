from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, plaid_router, transactions_router, subscriptions_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.development')

app = FastAPI(title="Haven API")

# Configure CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(plaid_router)
app.include_router(transactions_router)
app.include_router(subscriptions_router)


@app.get("/")
def root():
    return {
        "message": "Haven API is running!",
        "version": "0.1.0"
    }
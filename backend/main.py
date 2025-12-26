from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth_router, plaid_router, transactions_router, subscriptions_router, gambling_router, goals_router, budget_router
app = FastAPI(title="Haven API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth_router)
app.include_router(plaid_router)
app.include_router(transactions_router)
app.include_router(subscriptions_router)
app.include_router(gambling_router)
app.include_router(goals_router)
app.include_router(budget_router)

@app.get("/")
def read_root():
    return {"message": "Haven API"}
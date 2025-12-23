from sqlalchemy import create_engine, text

# Database URL from .env.development
DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/haven_dev"

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Test connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        print(f"Result: {result.fetchone()}")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
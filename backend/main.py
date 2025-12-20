from fastapi import FastAPI

app = FastAPI(title="Haven API")

@app.get("/")
def root():
    return {"message": "Haven API is running!"}
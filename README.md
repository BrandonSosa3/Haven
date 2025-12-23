Haven
Personal finance & travel management platform.
Project Structure
Haven/
├── backend/          # FastAPI backend
└── frontend/         # React frontend (coming soon)
Environments

Development: Local development with Docker
Production: Railway deployment

Setup
Backend Setup

Navigate to backend:

bashcd backend

Install dependencies:

bashpip install -r requirements.txt

Run development server:

bashuvicorn main:app --reload
Git Workflow

main - Production branch (auto-deploys to Railway)
develop - Development branch
Feature branches: feature/your-feature-name
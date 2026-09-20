import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine, Base
import app.models.social  # Import all models so they register with Base

print("Creating all tables from current models...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

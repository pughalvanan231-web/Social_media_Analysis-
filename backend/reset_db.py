from app.models.base import Base
from app.database.connection import engine
import app.models.social
from seed_users import seed_users

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Seeding users...")
seed_users()
print("Database reset complete.")

from app.database.connection import SessionLocal
from app.models.social import User
from app.core.security import get_password_hash

def seed_users():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin_user = User(
                username="admin",
                email="admin@gossip-protocol.local",
                hashed_password=get_password_hash("admin123"),
                role="ADMIN",
                is_active=True
            )
            db.add(admin_user)
            
            analyst_user = User(
                username="analyst",
                email="analyst@gossip-protocol.local",
                hashed_password=get_password_hash("analyst123"),
                role="ANALYST",
                is_active=True
            )
            db.add(analyst_user)
            
            db.commit()
            print("Users seeded successfully.")
        else:
            print("Users already exist.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()

from db.database import Base, engine
from db.models.admin import Admin

Base.metadata.create_all(bind=engine)

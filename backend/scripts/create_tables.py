from db.database import Base, engine
from db.models.admin import Admin
from db.models.user import User
from db.models.class_ import Class
from db.models.booking import Booking
from db.models.template_class import TemplateClass

print("Creating tables:", Base.metadata.tables.keys())
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

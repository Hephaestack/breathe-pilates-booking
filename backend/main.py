from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import users, classes, bookings, admin_auth
from db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://breathe-pilates-booking-frontned-static.onrender.com",
        "https://breathe-pilates-admin-panel.onrender.com",
        "https://admin.breathepilatesefizikou.com",
        "https://app.breathepilatesefizikou.com",
        "https://breathe-pilates-admin-panel-dev.onrender.com",
        "https://breathe-pilates-booking-frontend.onrender.com",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Healtch Check"])
def root():
    return {"message": "Breathe Pilates Booking API is running!"}

app.include_router(users.router)
app.include_router(classes.router)
app.include_router(bookings.router)
app.include_router(admin_auth.router)

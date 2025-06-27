from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import users, classes, bookings
from db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Breathe Pilates Booking API is running!"}

app.include_router(users.router)
app.include_router(classes.router)
app.include_router(bookings.router)

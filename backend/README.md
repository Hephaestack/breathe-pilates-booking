
# Breathe Pilates Booking API

A simple booking system backend for Pilates studio classes, built with FastAPI and SQLite.

---

## 🚀 Features

- User, Class, and Booking models
- REST API for:
  - Viewing users and their bookings
  - Viewing available classes
  - Creating and cancelling bookings
- Live count of current participants

---

## 📦 Requirements

- Python 3.10+ (recommended: 3.11+)
- pip (Python package manager)

---

## 🔧 Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/breathe-pilates-booking.git
cd breathe-pilates-booking/backend
```

### 2. Create virtual environment (optional but recommended)

```bash
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

---

## 🧪 Add test data

Run this script to populate the database with sample users, classes, and bookings:

```bash
python test_data.py
```

It will create an `app.db` SQLite file.

---

## 🏃 Run the API

```bash
uvicorn main:app --reload
```

Then open your browser to: <http://localhost:8000/docs> to explore and test the API via Swagger UI.

---

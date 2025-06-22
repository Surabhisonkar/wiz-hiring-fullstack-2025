from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime
from . import models, schemas, crud
from .database import get_db

from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, Mini-Calendly backend is working!"}

# Event endpoints
@app.post("/events/", response_model=schemas.Event)
async def create_event(event: schemas.EventCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_event(db, event)

@app.get("/events/", response_model=List[schemas.Event])
async def read_events(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.get_events(db, skip=skip, limit=limit)

@app.get("/events/{event_id}", response_model=schemas.Event)
async def read_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event = await crud.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

# Booking endpoints (generic)
@app.post("/bookings/", response_model=schemas.Booking)
async def create_booking(booking: schemas.BookingCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_booking(db, booking)

@app.get("/bookings/", response_model=List[schemas.Booking])
async def read_bookings(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.get_bookings(db, skip=skip, limit=limit)

@app.get("/events/{event_id}/bookings/", response_model=List[schemas.Booking])
async def read_bookings_for_event(
    event_id: int, skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)
):
    return await crud.get_bookings_for_event(db, event_id=event_id, skip=skip, limit=limit)

# New: Book slot for event with validation
@app.post("/events/{event_id}/bookings", response_model=schemas.Booking)
async def book_slot_for_event(
    event_id: int,
    booking_data: schemas.BookingCreate,
    db: AsyncSession = Depends(get_db)
):
    # 1. Get event
    event = await crud.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # 2. Check slot is valid
    if booking_data.slot not in event.slots:
        raise HTTPException(status_code=400, detail="Slot not valid")
    
    # 3. Count bookings for this slot
    bookings_for_slot = await crud.count_bookings_for_slot(db, event_id, booking_data.slot)
    if bookings_for_slot >= event.max_bookings:
        raise HTTPException(status_code=400, detail="Slot already fully booked")
    
    # 4. Create the booking
    new_booking = await crud.create_booking(
        db,
        schemas.BookingCreate(
            event_id=event_id,
            attendee_name=booking_data.attendee_name,
            attendee_email=booking_data.attendee_email,
            booked_at=datetime.utcnow(),
            slot=booking_data.slot
        )
    )
    return new_booking

# ---------------------------- Delete and Update ------------------------------------------

# Update an event
@app.put("/events/{event_id}/", response_model=schemas.Event)
async def update_event(event_id: int, event: schemas.EventCreate, db: AsyncSession = Depends(get_db)):
    updated = await crud.update_event(db, event_id, event)
    if updated is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated

# Delete an event
@app.delete("/events/{event_id}/", response_model=schemas.Event)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await crud.delete_event(db, event_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return deleted

# Update a booking
@app.put("/bookings/{booking_id}/", response_model=schemas.Booking)
async def update_booking(booking_id: int, booking: schemas.BookingCreate, db: AsyncSession = Depends(get_db)):
    updated = await crud.update_booking(db, booking_id, booking)
    if updated is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return updated

# Delete a booking
@app.delete("/bookings/{booking_id}/", response_model=schemas.Booking)
async def delete_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await crud.delete_booking(db, booking_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return deleted

# Double booking prevention
@app.post("/events/{event_id}/bookings", response_model=schemas.Booking)
async def book_slot_for_event(
    event_id: int,
    booking_data: schemas.BookingCreate,
    db: AsyncSession = Depends(get_db)
):
    # 1. Get event
    event = await crud.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # 2. Check slot is valid
    if booking_data.slot not in event.slots:
        raise HTTPException(status_code=400, detail="Slot not valid")
    
    # 3. Prevent duplicate booking for same user and slot
    existing = await crud.get_booking_by_email_slot(db, event_id, booking_data.slot, booking_data.attendee_email)
    if existing:
        raise HTTPException(status_code=400, detail="You have already booked this slot.")
    
    # 4. Count bookings for this slot
    bookings_for_slot = await crud.count_bookings_for_slot(db, event_id, booking_data.slot)
    if bookings_for_slot >= event.max_bookings:
        raise HTTPException(status_code=400, detail="Slot already fully booked")
    
    # 5. Create the booking
    new_booking = await crud.create_booking(
        db,
        schemas.BookingCreate(
            event_id=event_id,
            attendee_name=booking_data.attendee_name,
            attendee_email=booking_data.attendee_email,
            booked_at=datetime.utcnow(),
            slot=booking_data.slot
        )
    )
    return new_booking


# Booking page
@app.get("/users/{email}/bookings", response_model=List[schemas.Booking])
async def read_bookings_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    return await crud.get_bookings_by_email(db, email=email, skip=skip, limit=limit)
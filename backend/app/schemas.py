from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    organizer: str
    slots: List[str] = []
    max_bookings: int

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int

    class Config:
        from_attributes = True

# Booking schemas
class BookingBase(BaseModel):
    event_id: int
    attendee_name: str
    attendee_email: EmailStr
    booked_at: datetime
    slot: str  # THIS LINE IS REQUIRED

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int

    class Config:
        from_attributes = True
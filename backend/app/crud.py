from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas

async def create_event(db: AsyncSession, event: schemas.EventCreate):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

async def get_events(db: AsyncSession, skip: int = 0, limit: int = 10):
    result = await db.execute(select(models.Event).offset(skip).limit(limit))
    return result.scalars().all()

# Booking CRUD
async def create_booking(db: AsyncSession, booking: schemas.BookingCreate):
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

async def count_bookings_for_slot(db: AsyncSession, event_id: int, slot: str):
    from sqlalchemy import func
    result = await db.execute(
        select(func.count(models.Booking.id))
        .where(models.Booking.event_id == event_id, models.Booking.slot == slot)
    )
    return result.scalar()
    
async def get_bookings(db: AsyncSession, skip: int = 0, limit: int = 10):
    result = await db.execute(select(models.Booking).offset(skip).limit(limit))
    return result.scalars().all()

async def get_bookings_for_event(db: AsyncSession, event_id: int, skip: int = 0, limit: int = 10):
    from .models import Booking
    result = await db.execute(
        select(Booking).where(Booking.event_id == event_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_event(db: AsyncSession, event_id: int):
    result = await db.execute(select(models.Event).where(models.Event.id == event_id))
    return result.scalar_one_or_none()
#------------------------------------Delete and Update ---------------------------------------------
async def delete_event(db: AsyncSession, event_id: int):
    result = await db.execute(select(models.Event).where(models.Event.id == event_id))
    event = result.scalar_one_or_none()
    if event is None:
        return None
    await db.delete(event)
    await db.commit()
    return event

async def update_event(db: AsyncSession, event_id: int, event_update: schemas.EventCreate):
    result = await db.execute(select(models.Event).where(models.Event.id == event_id))
    event = result.scalar_one_or_none()
    if event is None:
        return None
    for key, value in event_update.dict().items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return event

async def delete_booking(db: AsyncSession, booking_id: int):
    result = await db.execute(select(models.Booking).where(models.Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        return None
    await db.delete(booking)
    await db.commit()
    return booking

async def update_booking(db: AsyncSession, booking_id: int, booking_update: schemas.BookingCreate):
    result = await db.execute(select(models.Booking).where(models.Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        return None
    for key, value in booking_update.dict().items():
        setattr(booking, key, value)
    await db.commit()
    await db.refresh(booking)
    return booking

# Double booking prevention

async def get_booking_by_email_slot(db: AsyncSession, event_id: int, slot: str, attendee_email: str):
    result = await db.execute(
        select(models.Booking)
        .where(
            models.Booking.event_id == event_id,
            models.Booking.slot == slot,
            models.Booking.attendee_email == attendee_email,
        )
    )
    return result.scalar_one_or_none()


async def get_bookings_by_email(db: AsyncSession, email: str, skip: int = 0, limit: int = 20):
    result = await db.execute(
        select(models.Booking).where(models.Booking.attendee_email == email).offset(skip).limit(limit)
    )
    return result.scalars().all()
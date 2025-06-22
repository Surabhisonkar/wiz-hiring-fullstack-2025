import asyncio
from datetime import datetime, timedelta

from app import models
from app.database import AsyncSessionLocal

async def seed():
    async with AsyncSessionLocal() as session:
        # Demo Events
        event1 = models.Event(
            title="AI Demo Call",
            description="Discuss the future of AI.",
            creator="alice@example.com",
            max_bookings_per_slot=2
        )
        event2 = models.Event(
            title="Design Brainstorm",
            description="UI/UX session.",
            creator="bob@example.com",
            max_bookings_per_slot=1
        )

        # Add slots for event1 (next 2 days, 10am and 11am)
        slot1 = models.Slot(
            start_time=datetime.utcnow() + timedelta(days=1, hours=10),
            event=event1
        )
        slot2 = models.Slot(
            start_time=datetime.utcnow() + timedelta(days=1, hours=11),
            event=event1
        )
        # Add slot for event2
        slot3 = models.Slot(
            start_time=datetime.utcnow() + timedelta(days=2, hours=13),
            event=event2
        )

        session.add_all([event1, event2, slot1, slot2, slot3])
        await session.commit()

        # Demo Bookings
        booking1 = models.Booking(
            name="Charlie",
            email="charlie@example.com",
            slot=slot1
        )
        booking2 = models.Booking(
            name="Dana",
            email="dana@example.com",
            slot=slot3
        )

        session.add_all([booking1, booking2])
        await session.commit()

    print("Seed data inserted!")

if __name__ == "__main__":
    asyncio.run(seed())
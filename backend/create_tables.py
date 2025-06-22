import asyncio
from app.database import engine
from app import models

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(create_tables())
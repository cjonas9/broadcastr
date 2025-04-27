from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from datetime import datetime
from db import Base


class UserArtistPlay(Base):
    __tablename__ = "user_artist_plays"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    artist_name = Column(String, index=True)
    period = Column(String)  # '7day', '1month', '12month', 'overall'
    playcount = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

class UserTrackPlay(Base):
    __tablename__ = "user_track_plays"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    artist_name = Column(String, index=True)
    track_name = Column(String, index=True)
    period = Column(String)
    playcount = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
def pre_init():
	load_dotenv()

	DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///lastfm.db")

	engine = create_engine(DATABASE_URL, echo=True)
	SessionLocal = sessionmaker(bind=engine)
	Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("✅ Database created!")
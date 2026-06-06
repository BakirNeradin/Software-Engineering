import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault(
    "HASH_SECRET_KEY",
    "test-secret-key-that-is-at-least-32-bytes",
)
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("MAIL_USERNAME", "test@example.com")
os.environ.setdefault("MAIL_PASSWORD", "test-password")
os.environ.setdefault("MAIL_FROM", "test@example.com")
os.environ.setdefault("MAIL_SERVER", "localhost")

import main  # noqa: E402
from database import Base, get_db  # noqa: E402


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
    Base.metadata.create_all(bind=engine)

    session = testing_session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    main.app.dependency_overrides[get_db] = override_get_db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()

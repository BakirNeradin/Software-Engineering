from datetime import datetime

from constants import RoleEnum
from main import get_password_hash
from models import Category, Listing, Location, UserModel


def create_user(
    db_session,
    *,
    user_id: str,
    username: str,
    password: str = "StrongPassword123",
    points: int = 0,
):
    location = Location(name=f"{username} location")
    db_session.add(location)
    db_session.flush()

    user = UserModel(
        id=user_id,
        username=username,
        email=f"{username}@example.com",
        hashed_password=get_password_hash(password),
        location_id=location.id,
        role=RoleEnum.USER,
        disabled=False,
        points=points,
    )
    db_session.add(user)
    db_session.commit()
    return user


def create_listing(db_session, *, owner_id: str, name: str = "Test laptop"):
    category = Category(name="Electronics")
    db_session.add(category)
    db_session.flush()

    listing = Listing(
        name=name,
        category_id=category.id,
        user_id=owner_id,
        description="A listing used by the API test suite.",
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)
    return listing


def test_registers_user_and_rejects_duplicate_username(client, db_session):
    location = Location(name="Sarajevo")
    db_session.add(location)
    db_session.commit()

    params = {
        "username": "new_user",
        "email": "new_user@example.com",
        "password": "StrongPassword123",
        "role": "user",
        "disabled": False,
        "location_id": str(location.id),
    }

    response = client.post("/users", params=params)

    assert response.status_code == 200
    assert response.json()["username"] == "new_user"
    assert response.json()["email"] == "new_user@example.com"

    duplicate = client.post(
        "/users",
        params={**params, "email": "another@example.com"},
    )
    assert duplicate.status_code == 400
    assert duplicate.json()["detail"] == "Username is already taken"


def test_login_returns_token_that_authenticates_current_user(client, db_session):
    create_user(
        db_session,
        user_id="login-user-id",
        username="login_user",
        password="CorrectPassword123",
    )

    login = client.post(
        "/token",
        data={"username": "login_user", "password": "CorrectPassword123"},
    )

    assert login.status_code == 200
    token = login.json()["access_token"]
    assert login.json()["token_type"] == "bearer"

    current_user = client.get(
        "/users/me/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert current_user.status_code == 200
    assert current_user.json()["username"] == "login_user"


def test_owner_can_highlight_listing_and_spend_points(client, db_session):
    owner = create_user(
        db_session,
        user_id="listing-owner-id",
        username="listing_owner",
        points=120,
    )
    listing = create_listing(db_session, owner_id=owner.id)
    previous_expiry = listing.highlighted_until

    response = client.put(
        "/highlight_listing",
        params={"listing_id": listing.id, "user_id": owner.id, "points": 60},
    )

    assert response.status_code == 200
    db_session.refresh(owner)
    db_session.refresh(listing)
    assert owner.points == 60
    assert listing.highlighted_until > previous_expiry
    assert listing.highlighted_until > datetime.now()


def test_listing_owner_matches_opened_profile(client, db_session):
    owner = create_user(
        db_session,
        user_id="profile-owner-id",
        username="profile_owner",
    )
    listing = create_listing(db_session, owner_id=owner.id)

    listing_response = client.get("/listing_by_id", params={"id": listing.id})
    assert listing_response.status_code == 200
    listing_owner_id = listing_response.json()["listing"]["user_id"]

    profile_response = client.get(
        "/get_user_by_id",
        params={"user_id": listing_owner_id},
    )
    assert profile_response.status_code == 200
    assert profile_response.json()["username"] == owner.username

    profile_listings = client.get(
        "/listing_by_user_id",
        params={"user_id": listing_owner_id},
    )
    returned_ids = {
        profile_listing["id"]
        for profile_listing in profile_listings.json()["listings"]
    }
    assert listing.id in returned_ids


def test_user_can_leave_review_on_listing_owners_profile(client, db_session):
    owner = create_user(
        db_session,
        user_id="reviewed-owner-id",
        username="reviewed_owner",
    )
    reviewer = create_user(
        db_session,
        user_id="reviewer-id",
        username="reviewer",
    )
    listing = create_listing(db_session, owner_id=owner.id)

    listing_response = client.get("/listing_by_id", params={"id": listing.id})
    reviewed_user_id = listing_response.json()["listing"]["user_id"]

    review_response = client.post(
        "/new_review",
        params={
            "reviewing_user_id": reviewer.id,
            "reviewing_username": reviewer.username,
            "reviewed_user_id": reviewed_user_id,
            "rating": 5,
            "comment": "Clear communication and an accurate listing.",
        },
    )

    assert review_response.status_code == 200
    reviews_response = client.get(
        "/get_reviews_for_user",
        params={"id": owner.id},
    )
    assert reviews_response.status_code == 200
    assert reviews_response.json() == [
        {
            "id": review_response.json()["id"],
            "reviewing_user_id": reviewer.id,
            "reviewing_username": reviewer.username,
            "reviewed_user_id": owner.id,
            "rating": 5,
            "comment": "Clear communication and an accurate listing.",
        }
    ]

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse

from database import SessionLocal
from models import User
from auth_utils import hash_pw, create_token


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

security = HTTPBearer(auto_error=False)


# ============================================================
# AUTHENTICATION HELPER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get the logged-in user from the SahaayAI token.

    Token format:
    sahaay_tok_<user_id>_<role>_<random>
    """

    if not credentials:
        return None

    token = credentials.credentials

    parts = token.split("_")

    if len(parts) < 4:
        return None

    if parts[0] != "sahaay" or parts[1] != "tok":
        return None

    try:
        user_id = int(parts[2])
    except (TypeError, ValueError):
        return None

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        return user

    except Exception:
        return None

    finally:
        db.close()


# ============================================================
# REGISTER
#
# POST /api/auth/register
# ============================================================

@router.post("/register", status_code=201)
def register(data: dict):

    # --------------------------------------------------------
    # Read input
    # --------------------------------------------------------

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    phone = str(
        data.get("phone", "")
    ).strip()

    password = str(
        data.get("password", "")
    )

    role = str(
        data.get("role", "citizen")
    ).strip().lower()

    # --------------------------------------------------------
    # Required fields
    # --------------------------------------------------------

    if not name or not email or not password:

        return JSONResponse(
            status_code=400,
            content={
                "error": "Name, email, and password are required"
            }
        )

    # --------------------------------------------------------
    # Basic password validation
    # --------------------------------------------------------

    if len(password) < 6:

        return JSONResponse(
            status_code=400,
            content={
                "error": "Password must be at least 6 characters"
            }
        )

    # --------------------------------------------------------
    # Role validation
    # --------------------------------------------------------

    if role not in ["citizen", "admin"]:
        role = "citizen"

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Check duplicate email
        # ----------------------------------------------------

        existing_user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )

        if existing_user:

            return JSONResponse(
                status_code=409,
                content={
                    "error": "Email already registered"
                }
            )

        # ----------------------------------------------------
        # Create user
        # ----------------------------------------------------

        user = User(

            name=name,

            email=email,

            phone=phone,

            password_hash=hash_pw(password),

            role=role
        )

        db.add(user)

        db.commit()

        db.refresh(user)

        # ----------------------------------------------------
        # Generate token
        # ----------------------------------------------------

        token = create_token(user)

        return {
            "message": "Registration successful",
            "token": token,
            "user": user.to_dict()
        }

    except Exception as e:

        db.rollback()

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )

    finally:
        db.close()


# ============================================================
# LOGIN
#
# POST /api/auth/login
# ============================================================

@router.post("/login")
def login(data: dict):

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )

    if not email or not password:

        return JSONResponse(
            status_code=400,
            content={
                "error": "Email and password are required"
            }
        )

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Find user
        # ----------------------------------------------------

        user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )

        if not user:

            return JSONResponse(
                status_code=401,
                content={
                    "error": "Invalid email or password"
                }
            )

        # ----------------------------------------------------
        # Check password
        # ----------------------------------------------------

        if user.password_hash != hash_pw(password):

            return JSONResponse(
                status_code=401,
                content={
                    "error": "Invalid email or password"
                }
            )

        # ----------------------------------------------------
        # Generate token
        # ----------------------------------------------------

        token = create_token(user)

        return {
            "message": "Login successful",
            "token": token,
            "user": user.to_dict()
        }

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )

    finally:
        db.close()


# ============================================================
# CURRENT USER
#
# GET /api/auth/me
# ============================================================

@router.get("/me")
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user = get_current_user(credentials)

    if not user:

        return {
            "authenticated": False
        }

    return {
        "authenticated": True,
        "user": user.to_dict()
    }
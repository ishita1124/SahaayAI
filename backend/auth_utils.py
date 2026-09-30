import hashlib
import secrets


def hash_pw(password):
    return hashlib.sha256(password.encode()).hexdigest()


def create_token(user):
    random_part = secrets.token_hex(16)

    return f"sahaay_tok_{user.id}_{user.role}_{random_part}"

USE as2856;

TRUNCATE TABLE users;

INSERT INTO users (email, password_hash, email_verified_at)
VALUES (
    'test@example.com',
    'password123',
    NOW()
);
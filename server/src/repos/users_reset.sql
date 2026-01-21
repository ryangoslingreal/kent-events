USE as2856;

TRUNCATE TABLE users;

INSERT INTO users (email, password_hash, is_verified)
VALUES (
    'test@example.com',
    'password123',
    TRUE
);
USE as2856;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_type ENUM("student", "society", "kentUni", "ksu") NOT NULL,

    email_verified_at TIMESTAMP NULL DEFAULT NULL,

    email_verification_code_hash CHAR(64) NULL DEFAULT NULL,
    email_verification_expires_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email),

    INDEX ix_users_email_verification_code_hash (email_verification_code_hash),
    INDEX ix_users_email_verified_at (email_verified_at)
) ENGINE=InnoDB;
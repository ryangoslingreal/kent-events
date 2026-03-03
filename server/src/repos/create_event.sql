USE as2856;

CREATE TABLE events(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL, 
    title VARCHAR(255) NOT NUll,
    subtitle VARCHAR(255),
    description VARCHAR(255) NOT NULL,

    image LONGBLOB,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,

    location VARCHAR(255) NOT NULL,
    tags JSON,  --need a list of tags not sure what to do
    price DECIMAL(4, 2) NOT NULL,   --max of 4 digits long, with 2 decimal points
    repeat_event ENUM('never','weekly','monthly') NOT NULL DEFAULT 'never',
    available_contact BOOLEAN NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id)
)
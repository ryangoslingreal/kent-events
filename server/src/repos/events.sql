CREATE TABLE events(
	id 	bigint unsigned auto_increment primary key,
    
    user_id BIGINT unsigned NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description VARCHAR(255) NOT NULL,
    
    image LONGBLOB,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    
    location VARCHAR(255) NOT NULL,
    tags JSON,
    price DECIMAL(4, 2) NOT NULL, 
    repeat_event ENUM('never', 'weekly', 'monthly') NOT NULL DEFAULT 'never',
    available_contact BOOLEAN NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		ON UPDATE CURRENT_TIMESTAMP, 
        
	CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id)
)
USE as2856;

CREATE TABLE events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NULL,

  location VARCHAR(255) NOT NULL,
  tags JSON NULL,

  ticket_url TEXT NULL,
  contact_email VARCHAR(255),

  image LONGBLOB NULL,
  image_mime VARCHAR(50) NULL,
    
  image_url TEXT NULL,
  background_image_url TEXT NULL,

  external_url TEXT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	  ON UPDATE CURRENT_TIMESTAMP, 
        
	CONSTRAINT fk_events_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT uq_events_external_url UNIQUE (external_url),

  INDEX ix_events_user_id (user_id),
  INDEX ix_events_date_start_time (date, start_time)
) ENGINE=InnoDB;
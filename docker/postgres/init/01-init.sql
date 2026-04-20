CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategory (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subcategory_category
        FOREIGN KEY (category_id)
        REFERENCES category(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_subcategory_name_per_category
        UNIQUE (category_id, name)
);

CREATE TABLE IF NOT EXISTS points_of_interest (
    id SERIAL PRIMARY KEY,
    subcategory_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_points_subcategory
        FOREIGN KEY (subcategory_id)
        REFERENCES subcategory(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_points_of_interest_location
ON points_of_interest
USING GIST (location);

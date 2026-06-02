
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    sender VARCHAR(100),
    recipient VARCHAR(100),
    origin VARCHAR(100),
    destination VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE shipment_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     shipment_id UUID REFERENCES shipments(id),
     event_type VARCHAR(50),
     description VARCHAR(255),
     created_at TIMESTAMP DEFAULT now()
);
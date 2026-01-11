CREATE TABLE cajeros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_cajero INT NOT NULL UNIQUE,
    pin_hash TEXT NOT NULL,
    nombre VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

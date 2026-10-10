-- Demo password for all seeded users: Password@123
-- bcrypt hash generated for Password@123
INSERT INTO users (name, email, password_hash)
VALUES
('Demo Owner', 'owner@example.com', '$2b$12$LQv3c1yqBWQ5r4J9Y8qQOeH2r0m7w5Lw8P4dJr5W9vQ9m3o1p2X7G'),
('Demo User', 'user@example.com', '$2b$12$LQv3c1yqBWQ5r4J9Y8qQOeH2r0m7w5Lw8P4dJr5W9vQ9m3o1p2X7G')
ON CONFLICT (email) DO NOTHING;

INSERT INTO properties
(owner_id, title, description, city, location, property_type, price, bedrooms, bathrooms, area_sqft, images)
SELECT
u.id,
'Modern 2 BHK Apartment',
'Bright apartment close to schools, offices and public transport.',
'Chennai',
'Pallikaranai',
'APARTMENT',
6500000,
2,
2,
1100,
ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c']
FROM users u
WHERE u.email = 'owner@example.com'
AND NOT EXISTS (
  SELECT 1 FROM properties p WHERE p.title = 'Modern 2 BHK Apartment'
);

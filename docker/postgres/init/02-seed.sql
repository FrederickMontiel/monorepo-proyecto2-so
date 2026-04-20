INSERT INTO category (name, description)
VALUES
('Cultural', 'Lugares de interés cultural e histórico'),
('Servicios', 'Servicios útiles para la población'),
('Natural', 'Lugares y destinos naturales'),
('Salud', 'Puntos relacionados con atención médica')
ON CONFLICT (name) DO NOTHING;

INSERT INTO subcategory (category_id, name, description)
VALUES
((SELECT id FROM category WHERE name = 'Cultural'), 'Museo', 'Museos y centros culturales'),
((SELECT id FROM category WHERE name = 'Cultural'), 'Parque', 'Parques y plazas históricas'),
((SELECT id FROM category WHERE name = 'Servicios'), 'Gasolinera', 'Estaciones de servicio'),
((SELECT id FROM category WHERE name = 'Natural'), 'Volcán', 'Volcanes y destinos naturales'),
((SELECT id FROM category WHERE name = 'Salud'), 'Hospital', 'Centros hospitalarios')
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO points_of_interest (subcategory_id, name, description, latitude, longitude, location)
VALUES
(
    (SELECT id FROM subcategory WHERE name = 'Parque' AND category_id = (SELECT id FROM category WHERE name = 'Cultural')),
    'Parque Central',
    'Centro histórico y punto de reunión principal',
    14.6349,
    -90.5069,
    ST_SetSRID(ST_MakePoint(-90.5069, 14.6349), 4326)::geography
),
(
    (SELECT id FROM subcategory WHERE name = 'Museo' AND category_id = (SELECT id FROM category WHERE name = 'Cultural')),
    'Museo Nacional de Arqueología',
    'Museo con exposición de piezas históricas',
    14.6157,
    -90.5270,
    ST_SetSRID(ST_MakePoint(-90.5270, 14.6157), 4326)::geography
),
(
    (SELECT id FROM subcategory WHERE name = 'Gasolinera' AND category_id = (SELECT id FROM category WHERE name = 'Servicios')),
    'Gasolinera Zona 10',
    'Estación de servicio abierta las 24 horas',
    14.5968,
    -90.5108,
    ST_SetSRID(ST_MakePoint(-90.5108, 14.5968), 4326)::geography
),
(
    (SELECT id FROM subcategory WHERE name = 'Volcán' AND category_id = (SELECT id FROM category WHERE name = 'Natural')),
    'Volcán de Pacaya',
    'Destino natural y turístico',
    14.3810,
    -90.6016,
    ST_SetSRID(ST_MakePoint(-90.6016, 14.3810), 4326)::geography
),
(
    (SELECT id FROM subcategory WHERE name = 'Hospital' AND category_id = (SELECT id FROM category WHERE name = 'Salud')),
    'Hospital General',
    'Centro de atención médica',
    14.6243,
    -90.5327,
    ST_SetSRID(ST_MakePoint(-90.5327, 14.6243), 4326)::geography
);

-- ============================================================================
-- TADA Migration 008: Seed Data for the Tema Pilot
-- ============================================================================
-- This is REAL operational data: the Tema pricing zone, the service catalog,
-- and partner hospitals. Run this once after migrations 001–007.
-- Indicative prices — review and adjust before production.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- DEFAULT PRICING ZONE (Tema and surrounds)
-- ---------------------------------------------------------------------------
-- Polygon roughly bounding the Tema Metropolitan Area. Replace with an
-- accurate GIS boundary before launch.
insert into public.pricing_zones (
  name, boundary,
  base_fare_pesewas, per_km_pesewas, per_minute_pesewas, minimum_fare_pesewas,
  critical_surcharge_pct, urgent_surcharge_pct, night_surcharge_pct,
  cancellation_fee_pesewas
) values (
  'Tema Metropolitan',
  st_geographyfromtext('SRID=4326;POLYGON((-0.10 5.55, 0.10 5.55, 0.10 5.80, -0.10 5.80, -0.10 5.55))'),
  5000,   -- GHC 50.00 base fare
  1500,   -- GHC 15.00 per km
  200,    -- GHC 2.00 per minute
  8000,   -- GHC 80.00 minimum fare
  20,     -- 20% surcharge for critical
  10,     -- 10% surcharge for urgent
  15,     -- 15% night surcharge (10pm–6am)
  2000    -- GHC 20.00 cancellation fee after acceptance
);

insert into public.pricing_zones (
  name, boundary,
  base_fare_pesewas, per_km_pesewas, per_minute_pesewas, minimum_fare_pesewas,
  critical_surcharge_pct, urgent_surcharge_pct, night_surcharge_pct,
  cancellation_fee_pesewas
) values (
  'Default (catch-all)',
  null,
  6000, 1800, 250, 10000, 20, 10, 15, 2000
);

-- ---------------------------------------------------------------------------
-- SERVICE CATALOG (indicative pricing — adjust before launch)
-- ---------------------------------------------------------------------------
insert into public.service_catalog (code, name, description, category, base_price_pesewas, requires_paramedic, requires_consent) values
  ('OXY',       'Oxygen administration',        'Supplemental oxygen via mask or cannula',           'medical_procedure', 4000,  true,  false),
  ('IV',        'IV line establishment',        'Establishing intravenous access',                   'medical_procedure', 6000,  true,  true),
  ('FLUIDS',    'IV fluids',                    'Saline or Ringer''s lactate per litre',             'medication',        3500,  true,  true),
  ('SPLINT',    'Splinting / immobilisation',   'Limb splinting for suspected fracture',             'medical_procedure', 2500,  false, false),
  ('SPINAL',    'Spinal immobilisation',        'Cervical collar and backboard',                     'medical_procedure', 4000,  true,  false),
  ('DEFIB',     'Defibrillator use',            'Manual or AED defibrillation',                      'equipment_use',     15000, true,  false),
  ('CPR',       'CPR performed',                'Cardiopulmonary resuscitation by paramedic',        'medical_procedure', 5000,  true,  false),
  ('WOUND',     'Wound dressing',               'Cleaning and dressing of wounds',                   'medical_procedure', 2000,  false, false),
  ('PAIN_MED',  'Pain medication',              'Administration of analgesic',                       'medication',        3000,  true,  true),
  ('NEBULISE',  'Nebuliser treatment',          'Nebulised bronchodilator',                          'medical_procedure', 3500,  true,  true),
  ('GLUCOSE',   'Blood glucose check',          'Capillary glucose measurement',                     'medical_procedure', 1000,  false, false),
  ('BP_MONITOR','Continuous BP monitoring',     'Automated cuff readings throughout transit',        'equipment_use',     1500,  false, false),
  ('ECG',       'ECG monitoring',               '3-lead or 12-lead ECG during transit',              'equipment_use',     5000,  true,  false),
  ('SUCTION',   'Airway suctioning',            'Clearing airway with suction device',               'medical_procedure', 2000,  true,  false),
  ('EXTRA_EMT', 'Additional paramedic',         'Second paramedic for critical cases',               'additional_personnel', 8000, false, false),
  ('STAIR',     'Stair-chair carry',            'Multi-storey carry without lift',                   'medical_procedure', 3000,  false, false),
  ('CONSUMABLES','Consumables (gloves, etc.)',  'Per-trip consumables fee',                          'consumable',         1000,  false, false);

-- ---------------------------------------------------------------------------
-- TEMA PARTNER HOSPITALS
-- ---------------------------------------------------------------------------
-- Replace coordinates and addresses with verified data from your partnership
-- documents before launch.
insert into public.hospitals (
  name, short_name, hospital_type, address, city, region, location,
  main_phone, emergency_phone,
  has_emergency_room, has_trauma_center, has_stroke_unit, has_cardiac_unit,
  has_pediatric_er, has_maternity, is_partner, is_active
) values
  (
    'Tema General Hospital', 'Tema General', 'public',
    'Hospital Road, Community 9, Tema', 'Tema', 'Greater Accra',
    st_geographyfromtext('SRID=4326;POINT(0.0167 5.6667)'),
    '+233303202164', '+233303202164',
    true, true, true, true, true, true, true, true
  ),
  (
    'Manhean Polyclinic', 'Manhean', 'public',
    'Tema Manhean, Tema', 'Tema', 'Greater Accra',
    st_geographyfromtext('SRID=4326;POINT(0.0050 5.6400)'),
    '+233303000000', null,
    true, false, false, false, false, true, true, true
  ),
  (
    'Narh-Bita Hospital', 'Narh-Bita', 'private',
    'Community 2, Tema', 'Tema', 'Greater Accra',
    st_geographyfromtext('SRID=4326;POINT(-0.0140 5.6300)'),
    '+233303209616', null,
    true, false, false, true, true, true, true, true
  );

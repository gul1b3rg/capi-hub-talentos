-- Tabla para correos de interesados en el portal educativo
CREATE TABLE educacion_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE educacion_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede registrar su email"
  ON educacion_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Solo lectura autenticada"
  ON educacion_waitlist FOR SELECT TO authenticated
  USING (true);

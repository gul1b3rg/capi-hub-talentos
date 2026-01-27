-- Tabla para correos de interesados en consultorías
CREATE TABLE consultoria_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permitir inserción pública (cualquiera puede registrarse)
ALTER TABLE consultoria_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede registrar su email"
  ON consultoria_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Solo lectura autenticada
CREATE POLICY "Solo lectura autenticada"
  ON consultoria_waitlist
  FOR SELECT
  TO authenticated
  USING (true);

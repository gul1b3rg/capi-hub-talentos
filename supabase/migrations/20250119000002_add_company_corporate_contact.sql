-- Agregar campos de contacto corporativo a la tabla companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS corporate_email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS corporate_phone TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN companies.corporate_email IS 'Correo institucional de la empresa para contacto público';
COMMENT ON COLUMN companies.corporate_phone IS 'Teléfono de contacto de la empresa';

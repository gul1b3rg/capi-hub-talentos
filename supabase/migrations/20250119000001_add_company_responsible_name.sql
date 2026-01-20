-- Agregar campo de nombre del responsable a la tabla companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS responsible_name TEXT;

-- Comentario para documentación
COMMENT ON COLUMN companies.responsible_name IS 'Nombre y apellido del responsable corporativo de la empresa';

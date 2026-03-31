
CREATE OR REPLACE FUNCTION public.generate_store_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  code TEXT := '';
  num INTEGER;
BEGIN
  FOR i IN 1..3 LOOP
    code := code || substr(chars, floor(random() * 26 + 1)::int, 1);
  END LOOP;
  num := floor(random() * 9000 + 1000)::int;
  code := code || '-' || num::text;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number(_store_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  today_str TEXT;
  seq INTEGER;
BEGIN
  today_str := to_char(now() AT TIME ZONE 'Africa/Porto-Novo', 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(split_part(invoice_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO seq
  FROM public.sales
  WHERE store_id = _store_id
    AND invoice_number LIKE 'FAC-' || today_str || '-%';
  RETURN 'FAC-' || today_str || '-' || lpad(seq::text, 4, '0');
END;
$$;

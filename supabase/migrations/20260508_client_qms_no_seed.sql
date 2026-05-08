-- activate_client_qms now only flags the client as active.
-- Documents are NOT copied from Preqal's register.
-- Client docs will be created through a separate process.
CREATE OR REPLACE FUNCTION activate_client_qms(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE crm_clients
    SET qms_active = true
  WHERE id = p_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_client_qms(uuid) TO authenticated;

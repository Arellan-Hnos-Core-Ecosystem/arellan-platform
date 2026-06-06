CREATE RULE no_update_audit_logs AS
  ON UPDATE TO audit_logs
  DO INSTEAD NOTHING;

CREATE RULE no_delete_audit_logs AS
  ON DELETE TO audit_logs
  DO INSTEAD NOTHING;

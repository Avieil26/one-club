-- Harden client privileges in the exposed public schema.
-- Keep SELECT permissions for anon (RLS policies still decide which rows are readable).
-- Keep normal authenticated INSERT/UPDATE/DELETE permissions, where RLS policies allow them.
-- Remove anonymous writes and client-side privileges that should not be available through the Data API.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON ALL TABLES IN SCHEMA public FROM anon;

REVOKE TRUNCATE, REFERENCES, TRIGGER
ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Keep future public tables from granting anonymous writes or special table privileges.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon;

-- Future tables must not grant TRUNCATE / REFERENCES / TRIGGER to signed-in API users.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM authenticated;

-- Future functions should not inherit PostgreSQL's default EXECUTE grant to PUBLIC.
-- Revoke explicit anonymous EXECUTE grants as well. Authenticated and service_role
-- retain their existing default grants; new client RPCs should still validate auth
-- and authorization in their function body.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- Remove mutable search_path warnings from two existing functions.
-- comment_is_blocked only uses PostgreSQL built-ins and constants.
ALTER FUNCTION public.comment_is_blocked(text) SET search_path = pg_catalog;

-- protect_profile only calls auth.uid() with an explicit schema qualifier and uses
-- PostgreSQL built-ins; put pg_catalog first and public second for safety.
ALTER FUNCTION public.protect_profile() SET search_path = pg_catalog, public;

-- Harden client privileges in the exposed public schema.
-- Keep SELECT permissions for anon (RLS policies still decide which rows are readable).
-- Keep normal authenticated INSERT/UPDATE/DELETE permissions, where RLS policies allow them.
-- Remove anonymous writes and client-side privileges that should not be available through the Data API.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON ALL TABLES IN SCHEMA public FROM anon;

REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON ALL TABLES IN SCHEMA public FROM authenticated;

REVOKE ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- All current public tables and both functions inspected for search_path are owned by postgres.
-- Keep future public tables from granting anonymous writes or special table privileges.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon;

-- Future tables must not grant TRUNCATE / REFERENCES / TRIGGER to signed-in API users.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLES FROM authenticated;

-- Future functions created by postgres should not inherit PostgreSQL's default
-- EXECUTE grant to PUBLIC. Also remove the schema-specific explicit anon grant.
-- Authenticated and service_role retain their existing default grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- Remove mutable search_path warnings from two existing functions.
-- comment_is_blocked only uses PostgreSQL built-ins and constants.
ALTER FUNCTION public.comment_is_blocked(text) SET search_path = pg_catalog;

-- protect_profile calls auth.uid() with an explicit schema qualifier and uses PostgreSQL
-- built-ins; pg_catalog alone is sufficient and prevents public-schema shadowing.
ALTER FUNCTION public.protect_profile() SET search_path = pg_catalog;

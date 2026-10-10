-- Harden client privileges in the exposed public schema.
-- Current tables: preserve SELECT grants and normal authenticated writes; RLS policies
-- continue to control row access. Remove anonymous writes and unnecessary client DDL
-- privileges, including PostgreSQL 17's MAINTAIN privilege.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON ALL TABLES IN SCHEMA public FROM anon;

REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON ALL TABLES IN SCHEMA public FROM authenticated;

REVOKE ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Secure defaults for future objects created by postgres in public:
-- grant no table/sequence/function privileges to API roles implicitly.
-- Future migrations must GRANT only the exact access their new objects need.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE ALL PRIVILEGES ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE ALL PRIVILEGES ON TABLES FROM authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated;

-- PostgreSQL otherwise grants EXECUTE to PUBLIC by default for new functions.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

-- comment_is_blocked only uses built-ins and constants, so pg_catalog is sufficient.
ALTER FUNCTION public.comment_is_blocked(text) SET search_path = pg_catalog;

-- protect_profile calls auth.uid() with its schema explicitly qualified and otherwise
-- uses built-ins. Pinning pg_catalog alone prevents public-schema shadowing.
ALTER FUNCTION public.protect_profile() SET search_path = pg_catalog;

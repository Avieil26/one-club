-- Read-only verification for 20261010212000_harden_public_table_grants_and_defaults.sql.
-- Run after applying the migration. Each row should return ok = true.

WITH public_tables AS (
  SELECT c.oid
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
),
checks AS (
  SELECT
    'RLS enabled on every public table' AS check_name,
    NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND NOT c.relrowsecurity
    ) AS ok
  UNION ALL
  SELECT
    'anon has no table write/maintenance/DDL grants',
    NOT EXISTS (
      SELECT 1 FROM public_tables t
      WHERE has_table_privilege('anon', t.oid, 'INSERT')
         OR has_table_privilege('anon', t.oid, 'UPDATE')
         OR has_table_privilege('anon', t.oid, 'DELETE')
         OR has_table_privilege('anon', t.oid, 'TRUNCATE')
         OR has_table_privilege('anon', t.oid, 'REFERENCES')
         OR has_table_privilege('anon', t.oid, 'TRIGGER')
         OR has_table_privilege('anon', t.oid, 'MAINTAIN')
    )
  UNION ALL
  SELECT
    'authenticated has no table maintenance/DDL grants',
    NOT EXISTS (
      SELECT 1 FROM public_tables t
      WHERE has_table_privilege('authenticated', t.oid, 'TRUNCATE')
         OR has_table_privilege('authenticated', t.oid, 'REFERENCES')
         OR has_table_privilege('authenticated', t.oid, 'TRIGGER')
         OR has_table_privilege('authenticated', t.oid, 'MAINTAIN')
    )
  UNION ALL
  SELECT
    'anon has no sequence privileges in public',
    NOT EXISTS (
      SELECT 1
      FROM information_schema.sequences s
      WHERE s.sequence_schema = 'public'
        AND (
          has_sequence_privilege('anon', format('%I.%I', s.sequence_schema, s.sequence_name), 'USAGE')
          OR has_sequence_privilege('anon', format('%I.%I', s.sequence_schema, s.sequence_name), 'SELECT')
          OR has_sequence_privilege('anon', format('%I.%I', s.sequence_schema, s.sequence_name), 'UPDATE')
        )
    )
  UNION ALL
  SELECT
    'future public tables have no default API grants',
    NOT EXISTS (
      SELECT 1
      FROM pg_default_acl d
      JOIN pg_namespace n ON n.oid = d.defaclnamespace
      CROSS JOIN LATERAL aclexplode(d.defaclacl) a
      WHERE d.defaclrole = 'postgres'::regrole
        AND n.nspname = 'public'
        AND d.defaclobjtype = 'r'
        AND a.grantee IN ('anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole)
    )
  UNION ALL
  SELECT
    'future public sequences have no default API grants',
    NOT EXISTS (
      SELECT 1
      FROM pg_default_acl d
      JOIN pg_namespace n ON n.oid = d.defaclnamespace
      CROSS JOIN LATERAL aclexplode(d.defaclacl) a
      WHERE d.defaclrole = 'postgres'::regrole
        AND n.nspname = 'public'
        AND d.defaclobjtype = 'S'
        AND a.grantee IN ('anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole)
    )
  UNION ALL
  SELECT
    'future public functions have no default API EXECUTE grants',
    NOT EXISTS (
      SELECT 1
      FROM pg_default_acl d
      JOIN pg_namespace n ON n.oid = d.defaclnamespace
      CROSS JOIN LATERAL aclexplode(d.defaclacl) a
      WHERE d.defaclrole = 'postgres'::regrole
        AND n.nspname = 'public'
        AND d.defaclobjtype = 'f'
        AND a.grantee IN ('anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole)
        AND a.privilege_type = 'EXECUTE'
    )
  UNION ALL
  SELECT
    'PUBLIC has no global default EXECUTE on postgres-owned functions',
    NOT EXISTS (
      SELECT 1
      FROM pg_default_acl d
      CROSS JOIN LATERAL aclexplode(d.defaclacl) a
      WHERE d.defaclrole = 'postgres'::regrole
        AND d.defaclnamespace = 0
        AND d.defaclobjtype = 'f'
        AND a.grantee = 0
        AND a.privilege_type = 'EXECUTE'
    )
  UNION ALL
  SELECT
    'comment_is_blocked has pinned search_path',
    EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'comment_is_blocked'
        AND p.proconfig @> ARRAY['search_path=pg_catalog']
    )
  UNION ALL
  SELECT
    'protect_profile has pinned search_path',
    EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'protect_profile'
        AND p.proconfig @> ARRAY['search_path=pg_catalog']
    )
)
SELECT check_name, ok
FROM checks
ORDER BY check_name;

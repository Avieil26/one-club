-- Defense in depth: prevent anonymous execution of privileged public RPCs.
-- Authenticated users retain explicit EXECUTE grants; the functions retain their
-- own auth.uid() / assert_admin() checks. Internal trigger/helper functions are
-- intentionally not changed.

REVOKE EXECUTE ON FUNCTION public.add_comment(text, uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_comment(text, uuid, text, text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_sbc_solution(text, text, text[], text, text, text, timestamptz, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_career_challenge(text, text, text, text, text, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_fut_post(text, text, text, text, text, text, text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_grounds_post(text, text, text, text, integer, text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_sbc_challenge(text, text, text, timestamptz, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_sbc_worked(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.moderate_career(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.moderate_comment(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.moderate_grounds_level(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rate_fut(uuid, integer, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.report_comment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.save_profile_squad(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_career(uuid, text, text, text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_comment_like(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_fut_like(uuid) FROM PUBLIC, anon;

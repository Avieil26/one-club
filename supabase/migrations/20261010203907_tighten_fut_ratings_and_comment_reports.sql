-- Tighten two database checks:
-- 1) A comment is only hidden after three distinct reports.
-- 2) FUT squads can only be rated after approval.

CREATE OR REPLACE FUNCTION public.report_comment(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_author uuid;
  v_report_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'צריך להתחבר';
  END IF;

  SELECT user_id INTO v_author
  FROM public.comments
  WHERE id = p_id;

  IF v_author IS NULL THEN
    RAISE EXCEPTION 'התגובה לא נמצאה';
  END IF;

  IF v_author = v_user THEN
    RAISE EXCEPTION 'אי אפשר לדווח על תגובה של עצמך';
  END IF;

  INSERT INTO public.reports (comment_id, reporter_id)
  VALUES (p_id, v_user)
  ON CONFLICT (comment_id, reporter_id) DO NOTHING;

  SELECT count(*) INTO v_report_count
  FROM public.reports
  WHERE comment_id = p_id;

  IF v_report_count >= 3 THEN
    UPDATE public.comments
    SET status = 'hidden_pending'
    WHERE id = p_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.rate_fut(
  p_post uuid,
  p_fit integer,
  p_fun integer,
  p_creativity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_author uuid;
  v_exists boolean;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'צריך להתחבר';
  END IF;

  IF p_fit NOT BETWEEN 1 AND 5
     OR p_fun NOT BETWEEN 1 AND 5
     OR p_creativity NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'הדירוג הוא בין 1 ל-5';
  END IF;

  SELECT user_id INTO v_author
  FROM public.fut_posts
  WHERE id = p_post
    AND kind = 'squad'
    AND status = 'approved';

  IF v_author IS NULL THEN
    RAISE EXCEPTION 'הקבוצה לא נמצאה';
  END IF;

  IF v_author = v_user THEN
    RAISE EXCEPTION 'אפשר לדרג קבוצות של אחרים';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.fut_ratings
    WHERE post_id = p_post
      AND user_id = v_user
  ) INTO v_exists;

  IF v_exists THEN
    UPDATE public.fut_ratings
    SET fit = p_fit, fun = p_fun, creativity = p_creativity
    WHERE post_id = p_post AND user_id = v_user;
  ELSE
    INSERT INTO public.fut_ratings (post_id, user_id, fit, fun, creativity)
    VALUES (p_post, v_user, p_fit, p_fun, p_creativity);

    PERFORM public.bump_profile(v_author, 0, 1);
  END IF;
END;
$function$;

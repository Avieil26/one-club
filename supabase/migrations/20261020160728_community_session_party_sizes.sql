alter table public.partner_sessions add constraint partner_session_party_size
 check (capacity <= case mode when 'Rush' then 4 when 'Co-op' then 2 when 'Practice' then 2 else 11 end);

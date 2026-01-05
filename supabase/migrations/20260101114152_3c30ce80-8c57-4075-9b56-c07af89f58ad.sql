-- Drop the security definer view and recreate as regular view
DROP VIEW IF EXISTS public.dashboard_metrics;

CREATE VIEW public.dashboard_metrics WITH (security_invoker = true) AS
SELECT 
  COUNT(DISTINCT c.id) as total_cases,
  COUNT(DISTINCT CASE WHEN c.status = 'resolved' THEN c.id END) as resolved_cases,
  COALESCE(SUM(c.amount), 0) as total_debt_amount,
  COALESCE(SUM(CASE WHEN co.recovered THEN co.amount_recovered ELSE 0 END), 0) as total_recovered,
  AVG(d.trust_score) as avg_dca_trust_score,
  COUNT(DISTINCT CASE WHEN da.sla_breached THEN da.id END) as total_sla_breaches
FROM public.cases c
LEFT JOIN public.case_outcomes co ON c.id = co.case_id
LEFT JOIN public.dcas d ON c.assigned_dca_id = d.id
LEFT JOIN public.dca_actions da ON c.id = da.case_id;
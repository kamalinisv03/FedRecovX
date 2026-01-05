-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'enterprise_user', 'dca_user');

-- Create case status enum
CREATE TYPE public.case_status AS ENUM ('new', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed');

-- Create action types enum
CREATE TYPE public.action_type AS ENUM ('call', 'email', 'sms', 'letter', 'payment_plan', 'escalation', 'legal_notice');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'enterprise_user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- DCAs (Debt Collection Agencies) table
CREATE TABLE public.dcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trust_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  sla_compliance_rate DECIMAL(5,2) DEFAULT 100.00,
  recovery_success_rate DECIMAL(5,2) DEFAULT 0.00,
  escalation_count INTEGER DEFAULT 0,
  total_cases_handled INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL DEFAULT 'CASE-' || substr(gen_random_uuid()::text, 1, 8),
  debtor_name TEXT NOT NULL,
  debtor_email TEXT,
  debtor_phone TEXT,
  amount DECIMAL(12,2) NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  status case_status NOT NULL DEFAULT 'new',
  assigned_dca_id UUID REFERENCES public.dcas(id),
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DCA Actions table (action log)
CREATE TABLE public.dca_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  dca_id UUID NOT NULL REFERENCES public.dcas(id),
  action_type action_type NOT NULL,
  notes TEXT,
  sla_deadline TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case outcomes table
CREATE TABLE public.case_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE,
  recovered BOOLEAN NOT NULL DEFAULT false,
  amount_recovered DECIMAL(12,2) DEFAULT 0,
  recovery_days INTEGER,
  closed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ML Predictions table
CREATE TABLE public.ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  recovery_probability DECIMAL(5,4) NOT NULL,
  risk_score TEXT,
  model_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dashboard metrics view (Power BI ready)
CREATE VIEW public.dashboard_metrics AS
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dca_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger function for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'enterprise_user');
  
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for DCAs
CREATE POLICY "Authenticated users can view DCAs" ON public.dcas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage DCAs" ON public.dcas
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cases
CREATE POLICY "Admins and enterprise users can view all cases" ON public.cases
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'enterprise_user')
  );

CREATE POLICY "Admins can manage all cases" ON public.cases
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enterprise users can create cases" ON public.cases
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'enterprise_user'));

-- RLS Policies for dca_actions
CREATE POLICY "Authenticated users can view actions" ON public.dca_actions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create actions" ON public.dca_actions
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for case_outcomes
CREATE POLICY "Authenticated users can view outcomes" ON public.case_outcomes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage outcomes" ON public.case_outcomes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ml_predictions
CREATE POLICY "Authenticated users can view predictions" ON public.ml_predictions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert predictions" ON public.ml_predictions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dcas_updated_at
  BEFORE UPDATE ON public.dcas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
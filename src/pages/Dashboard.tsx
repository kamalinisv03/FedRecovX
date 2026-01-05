import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Briefcase, DollarSign, TrendingUp, AlertTriangle, Building2, Brain } from 'lucide-react';

export default function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const [casesRes, dcasRes, actionsRes] = await Promise.all([
        supabase.from('cases').select('id, amount, status'),
        supabase.from('dcas').select('trust_score'),
        supabase.from('dca_actions').select('sla_breached'),
      ]);
      
      const cases = casesRes.data || [];
      const dcas = dcasRes.data || [];
      const actions = actionsRes.data || [];
      
      return {
        totalCases: cases.length,
        resolvedCases: cases.filter(c => c.status === 'resolved').length,
        totalDebt: cases.reduce((sum, c) => sum + Number(c.amount), 0),
        avgTrustScore: dcas.length ? dcas.reduce((sum, d) => sum + Number(d.trust_score), 0) / dcas.length : 0,
        slaBreaches: actions.filter(a => a.sla_breached).length,
        activeDcas: dcas.length,
      };
    },
  });

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">AI-governed debt collection overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Cases" value={metrics?.totalCases || 0} icon={<Briefcase className="h-6 w-6" />} />
        <MetricCard title="Total Debt" value={formatCurrency(metrics?.totalDebt || 0)} icon={<DollarSign className="h-6 w-6" />} variant="accent" />
        <MetricCard title="Resolved Cases" value={metrics?.resolvedCases || 0} icon={<TrendingUp className="h-6 w-6" />} variant="success" />
        <MetricCard title="Avg Trust Score" value={`${(metrics?.avgTrustScore || 0).toFixed(1)}%`} icon={<Building2 className="h-6 w-6" />} />
        <MetricCard title="SLA Breaches" value={metrics?.slaBreaches || 0} icon={<AlertTriangle className="h-6 w-6" />} variant="warning" />
        <MetricCard title="Active DCAs" value={metrics?.activeDcas || 0} icon={<Brain className="h-6 w-6" />} />
      </div>
    </DashboardLayout>
  );
}
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecoveryProbabilityBadge } from '@/components/dashboard/RecoveryProbabilityBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Brain } from 'lucide-react';

export default function Predictions() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ml_predictions').select('*, cases(reference_number, debtor_name, amount)').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ML Predictions</h1>
        <p className="text-muted-foreground">Recovery probability predictions</p>
      </div>

      {isLoading ? <Skeleton className="h-64" /> : !predictions?.length ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No predictions yet</p>
          <p className="text-sm text-muted-foreground/70">ML predictions will appear here</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="data-table">
            <thead className="bg-muted/50"><tr><th>Case</th><th>Amount</th><th>Recovery Probability</th><th>Risk</th><th>Model</th><th>Created</th></tr></thead>
            <tbody>
              {predictions.map(p => (
                <tr key={p.id}>
                  <td><p className="font-mono text-sm font-medium">{p.cases?.reference_number}</p><p className="text-xs text-muted-foreground">{p.cases?.debtor_name}</p></td>
                  <td className="font-semibold">${Number(p.cases?.amount || 0).toLocaleString()}</td>
                  <td><RecoveryProbabilityBadge probability={Number(p.recovery_probability)} /></td>
                  <td><span className="capitalize">{p.risk_score || 'N/A'}</span></td>
                  <td className="text-sm text-muted-foreground">{p.model_version}</td>
                  <td className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
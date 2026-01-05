import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CaseStatusBadge } from '@/components/dashboard/CaseStatusBadge';
import { RecoveryProbabilityBadge } from '@/components/dashboard/RecoveryProbabilityBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export function CaseTable() {
  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data: casesData, error } = await supabase
        .from('cases')
        .select(`
          *,
          dcas(name, trust_score),
          ml_predictions(recovery_probability, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return casesData;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center">
        <p className="text-lg font-medium text-muted-foreground">No cases yet</p>
        <p className="text-sm text-muted-foreground/70">Create a new case to get started</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="data-table">
        <thead className="bg-muted/50">
          <tr>
            <th>Case Ref</th>
            <th>Debtor</th>
            <th>Amount</th>
            <th>Days Overdue</th>
            <th>Status</th>
            <th>Assigned DCA</th>
            <th>Recovery Prob.</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem) => {
            const latestPrediction = caseItem.ml_predictions?.[0];
            return (
              <tr key={caseItem.id}>
                <td className="font-mono text-sm font-medium">
                  {caseItem.reference_number}
                </td>
                <td>
                  <div>
                    <p className="font-medium">{caseItem.debtor_name}</p>
                    {caseItem.debtor_email && (
                      <p className="text-xs text-muted-foreground">{caseItem.debtor_email}</p>
                    )}
                  </div>
                </td>
                <td className="font-semibold text-foreground">
                  {formatCurrency(Number(caseItem.amount))}
                </td>
                <td>
                  <span className={caseItem.days_overdue > 90 ? 'text-destructive font-semibold' : ''}>
                    {caseItem.days_overdue} days
                  </span>
                </td>
                <td>
                  <CaseStatusBadge status={caseItem.status} />
                </td>
                <td>
                  {caseItem.dcas ? (
                    <div>
                      <p className="font-medium">{caseItem.dcas.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Trust: {Number(caseItem.dcas.trust_score).toFixed(1)}%
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </td>
                <td>
                  {latestPrediction ? (
                    <RecoveryProbabilityBadge 
                      probability={Number(latestPrediction.recovery_probability)} 
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </td>
                <td className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
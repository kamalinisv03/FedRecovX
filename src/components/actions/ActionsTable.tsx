import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const actionTypeLabels: Record<string, string> = {
  call: 'Phone Call',
  email: 'Email',
  sms: 'SMS',
  letter: 'Letter',
  payment_plan: 'Payment Plan',
  escalation: 'Escalation',
  legal_notice: 'Legal Notice',
};

export function ActionsTable() {
  const { data: actions, isLoading } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dca_actions')
        .select(`
          *,
          cases(reference_number, debtor_name),
          dcas(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
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

  if (!actions || actions.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center">
        <p className="text-lg font-medium text-muted-foreground">No actions logged</p>
        <p className="text-sm text-muted-foreground/70">Actions will appear here when logged</p>
      </div>
    );
  }

  const getSlaStatus = (action: any) => {
    if (action.sla_breached) return 'breached';
    if (action.completed_at) return 'completed';
    if (action.sla_deadline && new Date(action.sla_deadline) < new Date()) return 'overdue';
    return 'pending';
  };

  const SlaStatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'breached':
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="data-table">
        <thead className="bg-muted/50">
          <tr>
            <th>Case</th>
            <th>DCA</th>
            <th>Action Type</th>
            <th>Notes</th>
            <th>SLA Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => {
            const slaStatus = getSlaStatus(action);
            return (
              <tr key={action.id}>
                <td>
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {action.cases?.reference_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.cases?.debtor_name}
                    </p>
                  </div>
                </td>
                <td className="font-medium">{action.dcas?.name}</td>
                <td>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                    {actionTypeLabels[action.action_type] || action.action_type}
                  </span>
                </td>
                <td className="max-w-xs truncate text-sm text-muted-foreground">
                  {action.notes || '-'}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <SlaStatusIcon status={slaStatus} />
                    <span
                      className={cn(
                        'text-xs font-medium capitalize',
                        slaStatus === 'completed' && 'text-success',
                        (slaStatus === 'breached' || slaStatus === 'overdue') && 'text-destructive',
                        slaStatus === 'pending' && 'text-muted-foreground'
                      )}
                    >
                      {slaStatus}
                    </span>
                  </div>
                </td>
                <td className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
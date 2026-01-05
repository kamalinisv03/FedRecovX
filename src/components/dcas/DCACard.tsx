import { TrustScoreBar } from '@/components/dashboard/TrustScoreBar';
import { Building2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface DCACardProps {
  dca: {
    id: string;
    name: string;
    trust_score: number;
    sla_compliance_rate: number | null;
    recovery_success_rate: number | null;
    escalation_count: number | null;
    total_cases_handled: number | null;
    is_active: boolean | null;
  };
}

export function DCACard({ dca }: DCACardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{dca.name}</h3>
            <span className={`text-xs font-medium ${dca.is_active ? 'text-success' : 'text-muted-foreground'}`}>
              {dca.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <TrustScoreBar score={Number(dca.trust_score)} />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-xs">SLA Compliance</span>
          </div>
          <p className="text-lg font-semibold">{Number(dca.sla_compliance_rate || 0).toFixed(1)}%</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs">Recovery Rate</span>
          </div>
          <p className="text-lg font-semibold">{Number(dca.recovery_success_rate || 0).toFixed(1)}%</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs">Escalations</span>
          </div>
          <p className="text-lg font-semibold">{dca.escalation_count || 0}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-xs">Cases Handled</span>
          </div>
          <p className="text-lg font-semibold">{dca.total_cases_handled || 0}</p>
        </div>
      </div>
    </div>
  );
}
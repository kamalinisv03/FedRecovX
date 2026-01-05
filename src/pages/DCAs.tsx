import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DCACard } from '@/components/dcas/DCACard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DCAs() {
  const { data: dcas, isLoading } = useQuery({
    queryKey: ['dcas-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dcas').select('*').order('trust_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">DCAs</h1>
        <p className="text-muted-foreground">Debt Collection Agency performance & trust scores</p>
      </div>
      
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">{dcas?.map(dca => <DCACard key={dca.id} dca={dca} />)}</div>
      )}
    </DashboardLayout>
  );
}
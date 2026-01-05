import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function CreateCaseForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dcas } = useQuery({
    queryKey: ['dcas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dcas')
        .select('id, name, trust_score')
        .eq('is_active', true)
        .order('trust_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const debtorName = formData.get('debtor_name') as string;
    const debtorEmail = formData.get('debtor_email') as string;
    const debtorPhone = formData.get('debtor_phone') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const daysOverdue = parseInt(formData.get('days_overdue') as string);
    const assignedDcaId = formData.get('assigned_dca_id') as string;
    const priority = formData.get('priority') as string;

    try {
      const { error } = await supabase.from('cases').insert({
        debtor_name: debtorName,
        debtor_email: debtorEmail || null,
        debtor_phone: debtorPhone || null,
        amount,
        days_overdue: daysOverdue,
        assigned_dca_id: assignedDcaId || null,
        priority: priority || 'medium',
        status: assignedDcaId ? 'assigned' : 'new',
      });

      if (error) throw error;

      toast({
        title: 'Case Created',
        description: 'New case has been successfully created.',
      });

      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debtor_name">Debtor Name *</Label>
            <Input id="debtor_name" name="debtor_name" required placeholder="John Doe" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debtor_email">Email</Label>
              <Input id="debtor_email" name="debtor_email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debtor_phone">Phone</Label>
              <Input id="debtor_phone" name="debtor_phone" placeholder="+1 555-0123" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required placeholder="1500.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days_overdue">Days Overdue *</Label>
              <Input id="days_overdue" name="days_overdue" type="number" min="0" required placeholder="30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_dca_id">Assign to DCA</Label>
            <Select name="assigned_dca_id">
              <SelectTrigger>
                <SelectValue placeholder="Select DCA (optional)" />
              </SelectTrigger>
              <SelectContent>
                {dcas?.map((dca) => (
                  <SelectItem key={dca.id} value={dca.id}>
                    {dca.name} (Trust: {Number(dca.trust_score).toFixed(0)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
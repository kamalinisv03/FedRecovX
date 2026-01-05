import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

const actionTypes = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'letter', label: 'Letter' },
  { value: 'payment_plan', label: 'Payment Plan' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'legal_notice', label: 'Legal Notice' },
];

export function ActionForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cases } = useQuery({
    queryKey: ['cases-for-action'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, reference_number, debtor_name, assigned_dca_id')
        .not('status', 'eq', 'closed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: dcas } = useQuery({
    queryKey: ['dcas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dcas')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const caseId = formData.get('case_id') as string;
    const dcaId = formData.get('dca_id') as string;
    const actionType = formData.get('action_type') as string;
    const notes = formData.get('notes') as string;

    try {
      // Calculate SLA deadline (24 hours from now for demo)
      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + 24);

      const { error } = await supabase.from('dca_actions').insert({
        case_id: caseId,
        dca_id: dcaId,
        action_type: actionType as any,
        notes: notes || null,
        sla_deadline: slaDeadline.toISOString(),
      });

      if (error) throw error;

      // Update case status to in_progress
      await supabase
        .from('cases')
        .update({ status: 'in_progress' })
        .eq('id', caseId);

      toast({
        title: 'Action Logged',
        description: 'DCA action has been recorded successfully.',
      });

      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
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
          Log Action
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log DCA Action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case_id">Case *</Label>
            <Select name="case_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.reference_number} - {c.debtor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dca_id">DCA *</Label>
            <Select name="dca_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select DCA" />
              </SelectTrigger>
              <SelectContent>
                {dcas?.map((dca) => (
                  <SelectItem key={dca.id} value={dca.id}>
                    {dca.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_type">Action Type *</Label>
            <Select name="action_type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Add notes about this action..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
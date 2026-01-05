import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ActionsTable } from '@/components/actions/ActionsTable';
import { ActionForm } from '@/components/actions/ActionForm';

export default function Actions() {
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Actions</h1>
          <p className="text-muted-foreground">DCA action log with SLA tracking</p>
        </div>
        <ActionForm />
      </div>
      <ActionsTable />
    </DashboardLayout>
  );
}
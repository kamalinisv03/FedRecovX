import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CaseTable } from '@/components/cases/CaseTable';
import { CreateCaseForm } from '@/components/cases/CreateCaseForm';

export default function Cases() {
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">Manage debt collection cases</p>
        </div>
        <CreateCaseForm />
      </div>
      <CaseTable />
    </DashboardLayout>
  );
}
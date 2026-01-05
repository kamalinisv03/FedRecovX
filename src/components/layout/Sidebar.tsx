import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Activity, 
  Brain, 
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'DCAs', href: '/dcas', icon: Building2 },
  { name: 'Actions', href: '/actions', icon: Activity },
  { name: 'ML Predictions', href: '/predictions', icon: Brain },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user, userRole } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Shield className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">FedRecovX</h1>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            AI Governance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'sidebar-link',
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 rounded-lg bg-sidebar-accent/50 p-3">
          <p className="text-xs text-sidebar-foreground/70">Signed in as</p>
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user?.email}
          </p>
          {userRole && (
            <span className="mt-1 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              {userRole.replace('_', ' ')}
            </span>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="sidebar-link sidebar-link-inactive w-full text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
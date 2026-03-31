import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Package, FolderOpen, Users, History,
  ArrowLeftRight, AlertTriangle, LogOut, Store, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DashboardLayout = () => {
  const { store, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!store) return;
    const fetchAlerts = async () => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .lte('stock', 0);
      // Also check products below threshold using raw filter
      const { data: lowStock } = await supabase
        .from('products')
        .select('id, stock, alert_threshold')
        .eq('store_id', store.id);
      const alerts = lowStock?.filter(p => p.stock <= p.alert_threshold).length || 0;
      setAlertCount(alerts);
    };
    fetchAlerts();
  }, [store]);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
    { to: '/dashboard/products', icon: Package, label: 'Produits' },
    { to: '/dashboard/categories', icon: FolderOpen, label: 'Catégories' },
    { to: '/dashboard/vendeurs', icon: Users, label: 'Vendeurs' },
    { to: '/dashboard/sales', icon: History, label: 'Ventes' },
    { to: '/dashboard/stock-movements', icon: ArrowLeftRight, label: 'Mouvements' },
    { to: '/dashboard/alerts', icon: AlertTriangle, label: 'Alertes', badge: alertCount },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Store className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm truncate max-w-[140px]">{store?.name || 'Ma Boutique'}</h2>
                <p className="text-xs text-sidebar-foreground/60">{store?.store_code}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge ? (
                  <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                    {item.badge}
                  </Badge>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name || 'Patron'}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-8 h-16 flex items-center">
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        <div className="p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCFA } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

const DashboardOverview = () => {
  const { store } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, salesCount: 0, stockValue: 0, alertCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Daily revenue
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('store_id', store.id)
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      const revenue = salesData?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
      const salesCount = salesData?.length || 0;

      // Stock value
      const { data: products } = await supabase
        .from('products')
        .select('stock, purchase_price, alert_threshold')
        .eq('store_id', store.id);

      const stockValue = products?.reduce((sum, p) => sum + (p.stock * Number(p.purchase_price)), 0) || 0;
      const alertCount = products?.filter(p => p.stock <= p.alert_threshold).length || 0;

      setStats({ revenue, salesCount, stockValue, alertCount });
      setLoading(false);
    };
    fetchStats();
  }, [store]);

  const cards = [
    { title: "Chiffre d'affaires du jour", value: formatCFA(stats.revenue), icon: TrendingUp, color: 'text-success' },
    { title: "Ventes du jour", value: stats.salesCount.toString(), icon: ShoppingCart, color: 'text-accent' },
    { title: "Valeur du stock", value: formatCFA(stats.stockValue), icon: Package, color: 'text-primary' },
    { title: "Alertes stock", value: stats.alertCount.toString(), icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-heading font-bold">{loading ? '...' : card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;

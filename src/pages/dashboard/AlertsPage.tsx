import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCFA } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

const AlertsPage = () => {
  const { store } = useAuth();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!store) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', store.id)
        .order('stock');
      const lowStock = data?.filter(p => p.stock <= p.alert_threshold) || [];
      setProducts(lowStock);
    };
    fetch();
  }, [store]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Alertes de stock</h1>
        <p className="text-muted-foreground text-sm">{products.length} produit(s) en alerte</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Seuil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="secondary">{p.categories?.name || '—'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Badge variant={p.stock === 0 ? 'destructive' : 'secondary'}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.alert_threshold}</TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucune alerte de stock
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;

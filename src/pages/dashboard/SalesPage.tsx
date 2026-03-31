import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCFA, formatDate } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, XCircle } from 'lucide-react';

const SalesPage = () => {
  const { store } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<any[]>([]);

  const fetch = async () => {
    if (!store) return;
    const { data } = await supabase
      .from('sales')
      .select('*, profiles!sales_vendeur_id_fkey(full_name)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });
    setSales(data || []);
  };

  useEffect(() => { fetch(); }, [store]);

  const cancelSale = async (sale: any) => {
    if (!confirm('Annuler cette vente ? Le stock sera ré-incrémenté.')) return;
    try {
      // Get sale items to re-increment stock
      const { data: items } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', sale.id);

      if (items) {
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock + item.quantity })
              .eq('id', item.product_id);

            await supabase.from('stock_movements').insert({
              store_id: store!.id,
              product_id: item.product_id,
              quantity: item.quantity,
              reason: `Annulation vente ${sale.invoice_number}`,
            });
          }
        }
      }

      await supabase.from('sales').update({ status: 'cancelled' }).eq('id', sale.id);
      toast({ title: 'Vente annulée', description: 'Le stock a été réajusté.' });
      fetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Historique des ventes</h1>
        <p className="text-muted-foreground text-sm">{sales.length} vente(s)</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-sm">{sale.invoice_number}</TableCell>
                  <TableCell>{sale.profiles?.full_name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(sale.created_at)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCFA(sale.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'completed' ? 'default' : 'destructive'}>
                      {sale.status === 'completed' ? 'Complétée' : 'Annulée'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {sale.status === 'completed' && (
                      <Button variant="ghost" size="sm" onClick={() => cancelSale(sale)}>
                        <XCircle className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucune vente
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

export default SalesPage;

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight } from 'lucide-react';

const StockMovementsPage = () => {
  const { store } = useAuth();
  const [movements, setMovements] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!store) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('stock_movements')
        .select('*, products(name)')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(100);
      setMovements(data || []);

      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('store_id', store.id);
      
      if (profs) {
        const profMap: Record<string, string> = {};
        profs.forEach(p => { profMap[p.user_id] = p.full_name; });
        setProfiles(profMap);
      }
    };
    fetch();
  }, [store]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Mouvements de stock</h1>
        <p className="text-muted-foreground text-sm">Historique des entrées et sorties</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.products?.name}</TableCell>
                  <TableCell>
                    <Badge variant={m.quantity > 0 ? 'default' : 'destructive'}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.reason}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {m.performed_by ? (profiles[m.performed_by] || 'Vendeur inconnu') : 'Système'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(m.created_at)}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucun mouvement enregistré
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

export default StockMovementsPage;

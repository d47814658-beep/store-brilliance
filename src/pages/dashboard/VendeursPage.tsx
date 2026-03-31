import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCFA } from '@/lib/formatters';
import { UserCheck, UserX, Users } from 'lucide-react';

const VendeursPage = () => {
  const { store } = useAuth();
  const { toast } = useToast();
  const [vendeurs, setVendeurs] = useState<any[]>([]);

  const fetch = async () => {
    if (!store) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('store_id', store.id)
      .neq('user_id', store.owner_id)
      .order('full_name');
    setVendeurs(data || []);
  };

  useEffect(() => { fetch(); }, [store]);

  const toggleStatus = async (vendeur: any) => {
    const newStatus = vendeur.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', vendeur.id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: newStatus === 'active' ? 'Vendeur activé' : 'Vendeur désactivé' });
      fetch();
    }
  };

  const statusLabel: Record<string, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
  };

  const statusVariant = (status: string) => {
    if (status === 'active') return 'default' as const;
    if (status === 'pending') return 'secondary' as const;
    return 'destructive' as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Vendeurs</h1>
        <p className="text-muted-foreground text-sm">{vendeurs.length} vendeur(s)</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendeurs.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{v.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(v.status)}>{statusLabel[v.status] || v.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(v)}>
                      {v.status === 'active' ? (
                        <><UserX className="h-4 w-4 mr-1" /> Désactiver</>
                      ) : (
                        <><UserCheck className="h-4 w-4 mr-1" /> Activer</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {vendeurs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucun vendeur inscrit
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

export default VendeursPage;

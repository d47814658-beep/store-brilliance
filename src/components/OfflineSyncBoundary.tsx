import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPendingSales, removePendingSale } from '@/lib/offlineStore';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';

export const OfflineSyncBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleOnline = useCallback(async () => {
    setIsOnline(true);
    toast({ title: 'Connexion rétablie', description: 'Synchronisation en cours...' });

    setSyncing(true);
    try {
      const pendingSales = await getPendingSales();
      if (pendingSales.length > 0) {
        for (const sale of pendingSales) {
          // 1. Create sale
          const { data: newSale, error: saleError } = await supabase
            .from('sales')
            .insert({
              store_id: sale.store_id,
              vendeur_id: sale.vendeur_id,
              invoice_number: sale.invoice_number,
              total_amount: sale.total_amount,
              status: 'completed',
              created_at: sale.created_at, // Preserve original time
            })
            .select()
            .single();

          if (saleError) throw saleError;

          // 2. Create items & subtract from remote stock
          for (const item of sale.cart) {
            await supabase.from('sale_items').insert({
              sale_id: newSale.id,
              product_id: item.product_id,
              product_name: item.name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.unit_price * item.quantity,
            });

            // Decrement stock in DB
            const { data: remoteProduct } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single();

            if (remoteProduct) {
              await supabase
                .from('products')
                .update({ stock: remoteProduct.stock - item.quantity })
                .eq('id', item.product_id);

              await supabase.from('stock_movements').insert({
                store_id: sale.store_id,
                product_id: item.product_id,
                quantity: -item.quantity,
                reason: `Vente ${sale.invoice_number} (Sync hors ligne)`,
                performed_by: sale.vendeur_id,
                created_at: sale.created_at,
              });
            }
          }

          // Delete from local pending
          await removePendingSale(sale.id);
        }
        toast({ title: 'Synchronisation réussie', description: `${pendingSales.length} ventes envoyées.` });
      }
    } catch (error: any) {
      toast({ title: 'Erreur de synchronisation', description: error.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast({ title: 'Réseau hors ligne', description: 'Vous êtes passé en mode hors ligne. Les ventes seront sauvegardées.', variant: 'destructive' });
  }, [toast]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Initial check on mount just in case
  useEffect(() => {
    if (isOnline) {
      handleOnline();
    }
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 flex items-center justify-center text-xs font-medium z-50">
          <WifiOff className="h-4 w-4 mr-2" />
          Mode hors ligne • Enregistrement local activé
        </div>
      )}
      {syncing && (
        <div className="bg-success text-success-foreground px-4 py-2 flex items-center justify-center text-xs font-medium z-50">
          <Wifi className="h-4 w-4 mr-2 animate-pulse" />
          Synchronisation avec le serveur...
        </div>
      )}
      {children}
    </>
  );
};

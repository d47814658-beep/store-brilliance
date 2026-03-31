import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCFA } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';

const ProductsPage = () => {
  const { store } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', category_id: '', purchase_price: '', selling_price: '', stock: '', alert_threshold: '5' });

  const fetchProducts = async () => {
    if (!store) return;
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('store_id', store.id)
      .order('name');
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    if (!store) return;
    const { data } = await supabase.from('categories').select('*').eq('store_id', store.id).order('name');
    setCategories(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        store_id: store!.id,
        name: form.name,
        category_id: form.category_id || null,
        purchase_price: parseFloat(form.purchase_price),
        selling_price: parseFloat(form.selling_price),
        stock: parseInt(form.stock),
        alert_threshold: parseInt(form.alert_threshold),
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: 'Produit mis à jour' });
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        // Log stock movement for initial stock
        await supabase.from('stock_movements').insert({
          store_id: store!.id,
          product_id: (await supabase.from('products').select('id').eq('name', form.name).eq('store_id', store!.id).single()).data?.id,
          quantity: parseInt(form.stock),
          reason: 'Stock initial',
        });
        toast({ title: 'Produit créé' });
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Produit supprimé' });
      fetchProducts();
    }
  };

  const resetForm = () => {
    setForm({ name: '', category_id: '', purchase_price: '', selling_price: '', stock: '', alert_threshold: '5' });
    setEditingProduct(null);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category_id: product.category_id || '',
      purchase_price: product.purchase_price.toString(),
      selling_price: product.selling_price.toString(),
      stock: product.stock.toString(),
      alert_threshold: product.alert_threshold.toString(),
    });
    setDialogOpen(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Produits</h1>
          <p className="text-muted-foreground text-sm">{products.length} produit(s)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Ajouter un produit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix d'achat (FCFA)</Label>
                  <Input type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} required min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Prix de vente (FCFA)</Label>
                  <Input type="number" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} required min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock initial</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Seuil d'alerte</Label>
                  <Input type="number" value={form.alert_threshold} onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })} required min="0" />
                </div>
              </div>
              <Button type="submit" className="w-full">{editingProduct ? 'Mettre à jour' : 'Créer le produit'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix achat</TableHead>
                <TableHead className="text-right">Prix vente</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.categories?.name && (
                      <Badge variant="secondary">{product.categories.name}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCFA(product.purchase_price)}</TableCell>
                  <TableCell className="text-right">{formatCFA(product.selling_price)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={product.stock <= product.alert_threshold ? 'destructive' : 'secondary'}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucun produit trouvé
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

export default ProductsPage;

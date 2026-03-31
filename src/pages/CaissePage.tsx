import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatCFA } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, Trash2, ShoppingCart, Check, LogOut, History } from 'lucide-react';

interface CartItem {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  max_stock: number;
}

const CaissePage = () => {
  const { user, profile, store, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [todaySales, setTodaySales] = useState<any[]>([]);

  useEffect(() => {
    if (!store) return;
    const fetchData = async () => {
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', store.id)
        .order('name');
      setProducts(prods || []);

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', store.id)
        .order('name');
      setCategories(cats || []);
    };
    fetchData();
  }, [store]);

  const fetchTodaySales = async () => {
    if (!store || !user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('store_id', store.id)
      .eq('vendeur_id', user.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
    setTodaySales(data || []);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.category_id === selectedCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ title: 'Stock insuffisant', variant: 'destructive' });
          return prev;
        }
        return prev.map(i =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        unit_price: Number(product.selling_price),
        quantity: 1,
        max_stock: product.stock,
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev
      .map(item => {
        if (item.product_id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.max_stock) {
          toast({ title: 'Stock insuffisant', variant: 'destructive' });
          return item;
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const validateSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      // Generate invoice number
      const { data: invoiceNum } = await supabase.rpc('generate_invoice_number', { _store_id: store!.id });

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          store_id: store!.id,
          vendeur_id: user!.id,
          invoice_number: invoiceNum,
          total_amount: cartTotal,
          status: 'completed',
        })
        .select()
        .single();
      if (saleError) throw saleError;

      // Create sale items and update stock
      for (const item of cart) {
        await supabase.from('sale_items').insert({
          sale_id: sale.id,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        });

        // Decrement stock
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id);

          await supabase.from('stock_movements').insert({
            store_id: store!.id,
            product_id: item.product_id,
            quantity: -item.quantity,
            reason: `Vente ${invoiceNum}`,
            performed_by: user!.id,
          });
        }
      }

      toast({ title: 'Vente validée !', description: `Facture ${invoiceNum}` });
      setCart([]);

      // Refresh products
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', store!.id)
        .order('name');
      setProducts(prods || []);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/caisse');
  };

  // Check if vendeur is pending
  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">En attente d'activation</h2>
            <p className="text-muted-foreground text-sm mb-4">Votre compte doit être activé par le patron de la boutique.</p>
            <Button variant="outline" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Se déconnecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.status === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-heading font-bold mb-2">Compte désactivé</h2>
            <p className="text-muted-foreground text-sm mb-4">Contactez le patron de votre boutique.</p>
            <Button variant="outline" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Se déconnecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>← Retour</Button>
          <h1 className="font-heading font-bold">Mes ventes du jour</h1>
          <div />
        </header>
        <div className="p-4 space-y-3">
          {todaySales.map(sale => (
            <Card key={sale.id}>
              <CardContent className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm">{sale.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleTimeString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold">{formatCFA(sale.total_amount)}</p>
                    <Badge variant={sale.status === 'completed' ? 'default' : 'destructive'} className="text-xs">
                      {sale.status === 'completed' ? 'OK' : 'Annulée'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {todaySales.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucune vente aujourd'hui</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-heading font-bold leading-tight">{store?.name}</p>
            <p className="text-xs text-muted-foreground">{profile?.full_name}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { fetchTodaySales(); setShowHistory(true); }}>
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Search and filters */}
      <div className="px-4 py-3 space-y-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Button variant={!selectedCategory ? 'default' : 'secondary'} size="sm" className="shrink-0 text-xs h-7" onClick={() => setSelectedCategory(null)}>
            Tout
          </Button>
          {categories.map(cat => (
            <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'secondary'} size="sm" className="shrink-0 text-xs h-7" onClick={() => setSelectedCategory(cat.id)}>
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`text-left p-3 rounded-lg border border-border transition-all ${
                product.stock <= 0
                  ? 'opacity-40 cursor-not-allowed bg-muted'
                  : 'bg-card hover:border-primary/30 hover:shadow-sm active:scale-[0.98]'
              }`}
            >
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
              <div className="flex justify-between items-end mt-1.5">
                <p className="text-sm font-heading font-bold">{formatCFA(product.selling_price)}</p>
                <Badge variant={product.stock <= product.alert_threshold ? 'destructive' : 'secondary'} className="text-[10px] px-1.5">
                  {product.stock}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="border-t border-border bg-card px-4 py-3 space-y-2 shrink-0">
          <div className="max-h-32 overflow-y-auto space-y-1.5">
            {cart.map(item => (
              <div key={item.product_id} className="flex items-center justify-between gap-2">
                <p className="text-sm truncate flex-1">{item.name}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-20 text-right">{formatCFA(item.unit_price * item.quantity)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.product_id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">{cart.reduce((s, i) => s + i.quantity, 0)} article(s)</p>
              <p className="text-lg font-heading font-bold">{formatCFA(cartTotal)}</p>
            </div>
            <Button onClick={validateSale} disabled={processing} className="h-11 px-6">
              <Check className="h-4 w-4 mr-2" />
              {processing ? 'Validation...' : 'Valider la vente'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaissePage;

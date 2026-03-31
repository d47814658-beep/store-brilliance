import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Hash, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

const VendeurAuth = () => {
  const [step, setStep] = useState<'code' | 'register' | 'login'>('login');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [storeCode, setStoreCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [foundStore, setFoundStore] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('store_code', storeCode.toUpperCase())
        .single();

      if (error || !store) {
        toast({ title: 'Code invalide', description: 'Aucune boutique trouvée avec ce code.', variant: 'destructive' });
        return;
      }

      setFoundStore(store);
      setStep('register');
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + '/caisse' },
      });
      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('profiles').insert({
          user_id: authData.user.id,
          store_id: foundStore.id,
          full_name: fullName,
          email,
          status: 'pending',
        });

        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'vendeur',
        });

        toast({
          title: 'Compte créé !',
          description: 'Votre compte est en attente d\'activation par le patron de la boutique.',
        });
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/caisse');
    } catch (error: any) {
      toast({ title: 'Erreur de connexion', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail.' });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Mot de passe oublié</CardTitle>
            <CardDescription>Entrez votre email pour recevoir un lien</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <ShoppingCart className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Caisse</h1>
          <p className="text-muted-foreground mt-1">Interface vendeur</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-2 mb-2">
              <Button variant={step === 'login' ? 'default' : 'secondary'} size="sm" onClick={() => setStep('login')} className="flex-1">
                Connexion
              </Button>
              <Button variant={step === 'code' || step === 'register' ? 'default' : 'secondary'} size="sm" onClick={() => setStep('code')} className="flex-1">
                Inscription
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(true)}>
                  Mot de passe oublié ?
                </Button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <CardDescription className="mb-2">Entrez le code de votre boutique pour vous inscrire</CardDescription>
                <div className="space-y-2">
                  <Label htmlFor="storeCode">Code boutique</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="storeCode" placeholder="XXX-0000" value={storeCode} onChange={(e) => setStoreCode(e.target.value)} className="pl-10 uppercase tracking-widest font-mono" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Vérification...' : 'Vérifier le code'}
                </Button>
              </form>
            )}

            {step === 'register' && foundStore && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-secondary rounded-lg p-3 text-center mb-2">
                  <p className="text-sm text-muted-foreground">Boutique</p>
                  <p className="font-heading font-semibold text-foreground">{foundStore.name}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" placeholder="Votre nom" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Création...' : "S'inscrire"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous êtes patron ?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/')}>
            Espace patron
          </Button>
        </p>
      </div>
    </div>
  );
};

export default VendeurAuth;

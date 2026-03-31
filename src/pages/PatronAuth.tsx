import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

const PatronAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Erreur de connexion', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;

      if (authData.user) {
        // Generate store code
        const { data: codeData } = await supabase.rpc('generate_store_code');
        const storeCode = codeData || 'GCO-0001';

        // Create store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .insert({ owner_id: authData.user.id, name: storeName, store_code: storeCode })
          .select()
          .single();
        if (storeError) throw storeError;

        // Create profile
        await supabase.from('profiles').insert({
          user_id: authData.user.id,
          store_id: storeData.id,
          full_name: fullName,
          email,
          status: 'active',
        });

        // Assign role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'patron',
        });

        toast({ title: 'Compte créé !', description: 'Vérifiez votre email pour confirmer votre compte.' });
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
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
            <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="reset-email" type="email" placeholder="patron@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Store className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">GCO</h1>
          <p className="text-muted-foreground mt-1">Gestion Commerciale en Ligne</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-2 mb-2">
              <Button variant={isLogin ? 'default' : 'secondary'} size="sm" onClick={() => setIsLogin(true)} className="flex-1">
                Connexion
              </Button>
              <Button variant={!isLogin ? 'default' : 'secondary'} size="sm" onClick={() => setIsLogin(false)} className="flex-1">
                Inscription
              </Button>
            </div>
            <CardDescription>
              {isLogin ? 'Connectez-vous à votre espace patron' : 'Créez votre boutique en quelques secondes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nom de la boutique</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="storeName" placeholder="Ma Boutique" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="patron@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer ma boutique'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {isLogin && (
                <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(true)}>
                  Mot de passe oublié ?
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous êtes vendeur ?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/caisse')}>
            Accéder à la caisse
          </Button>
        </p>
      </div>
    </div>
  );
};

export default PatronAuth;

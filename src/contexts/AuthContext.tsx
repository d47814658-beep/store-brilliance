import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  store: any | null;
  userRole: 'patron' | 'vendeur' | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  store: null,
  userRole: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [store, setStore] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<'patron' | 'vendeur' | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const role = roles?.[0]?.role as 'patron' | 'vendeur' | null;
      setUserRole(role);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      setProfile(profileData);

      // Fetch store
      if (role === 'patron') {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', userId)
          .single();
        setStore(storeData);
      } else if (profileData?.store_id) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('id', profileData.store_id)
          .single();
        setStore(storeData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setStore(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setStore(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, store, userRole, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

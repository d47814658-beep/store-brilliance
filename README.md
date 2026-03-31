# GCO Store - Brilliance

Logiciel de gestion interne pour **ON AGENCY**. Cette application est une PWA (Progressive Web App) conçue pour la gestion des stocks, des ventes et des boutiques avec un support complet du mode hors-ligne.

## 🚀 Fonctionnalités
- Gestion des boutiques et des employés
- Suivi des stocks en temps réel
- Système de caisse et facturation PDF
- Mode hors-ligne avec synchronisation automatique via IndexedDB
- Rapports et analyses de performance (KPIs)

## 🛠️ Installation Locale

1. **Cloner le projet**
   ```bash
   git clone <url-du-depot>
   cd store-brilliance
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Environnement**
   Créez un fichier `.env` à la racine en vous basant sur `.env.example` :
   ```bash
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:8080`.

## 📦 Déploiement sur Vercel

Le projet est prêt à être déployé sur Vercel :

1. Créez un nouveau projet sur Vercel et importez ce dépôt.
2. **Configuration automatique** : Vercel détectera `vite` et utilisera les bons paramètres.
3. **Paramètres de build** :
   - Build Command : `npm run build`
   - Output Directory : `dist`
4. **Variables d'environnement** : Ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
5. **Routage** : Le fichier `vercel.json` à la racine gère déjà les redirections pour le Single Page Application (SPA).

## 🛡️ Structure du projet
- `src/components` : Composants UI réutilisables (shadcn/ui)
- `src/hooks` : Hooks personnalisés pour la logique et Supabase
- `src/pages` : Pages principales de l'application
- `src/lib` : Configuration des bibliothèques (Supabase, utils)
- `supabase/` : Migrations et schémas de la base de données

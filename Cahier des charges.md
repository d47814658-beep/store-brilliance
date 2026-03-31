CAHIER DES CHARGES

Logiciel de Gestion Boutique

Logiciel sur mesure — Usage interne exclusif

Rôle

Information

Maître d'ouvrage

À compléter — ON AGENCY

Maître d'œuvre

ON AGENCY

Version

4.0 — Document de référence contractuelle

Date

28/03/2026

Statut

FINAL — Prêt pour signature

Nature

Logiciel sur mesure — non destiné à la revente

1. CONTEXTE ET OBJECTIF

1.1 Situation actuelle

L'entreprise cliente dispose d'une boutique physique avec plusieurs employés vendeurs. À ce jour, aucun outil numérique ne permet au patron de suivre les ventes en temps réel, de contrôler le stock ni de vérifier l'activité individuelle de chaque vendeur. La gestion repose sur des cahiers manuscrits, sources d'erreurs et de perte d'informations.

1.2 Objectif du projet

Concevoir et livrer un logiciel de gestion interne sur mesure, exclusivement destiné à cette entreprise. Le logiciel couvre trois besoins fondamentaux :

Gestion du stock en temps réel (entrées et sorties automatisées).

Suivi des ventes par employé (historique, performance, responsabilité).

Génération de factures clients numérotées et horodatées.

1.3 Périmètre et exclusions

Ce logiciel est un outil de gestion interne. Il n'est pas destiné à la revente ni à une commercialisation externe.

Fonctionnalités HORS périmètre — non incluses dans cette version :

Gestion de remises ou promotions commerciales.

Gestion des retours et échanges produits.

Comptabilité générale ou déclarations fiscales (e-MECeF / DGI).

Gestion multi-boutiques (une seule boutique par déploiement).

Module de caisse physique / intégration TPE.

Gestion des fournisseurs et bons de commande.

Application mobile native (iOS / Android via Play Store ou App Store).

Toute demande hors périmètre fera l'objet d'un devis complémentaire séparé.

1. SYSTÈME D'ACCÈS ET D'AUTHENTIFICATION

2.1 Architecture des accès — Séparation par URL

Le logiciel repose sur deux URLs distinctes correspondant à deux espaces totalement séparés. Cette séparation est physique et non optionnelle.

URL

Destinataire

Contenu affiché

gco.com

Patron uniquement

Créer une boutique — Se connecter comme patron. Aucune option vendeur visible.

gco.com/caisse

Vendeur uniquement

S'inscrire avec un code boutique — Se connecter comme vendeur. Aucune option création de boutique visible.

Règle absolue : La création de boutique est exclusivement accessible sur gco.com.

2.2 Communication Patron -> Vendeurs

Le patron transmet deux informations lors de l'onboarding :

Le lien de l'espace caisse : gco.com/caisse

Le code boutique unique (ex : BOU-4821).

2.3 Parcours du Patron (gco.com)

Création du compte : Nom boutique, email pro, mot de passe.

Validation : Email de confirmation requis.

Code unique : Attribué automatiquement (format : XXX-0000).

Récupération de mot de passe : Via lien email (valable 1h).

2.4 Parcours du Vendeur (gco.com/caisse)

Inscription : Saisie du code boutique -> Affichage du nom pour confirmation -> Création profil.

Statut initial : « En attente d'activation ». Le vendeur ne peut pas vendre tant que le patron n'a pas validé son compte dans le tableau de bord.

Récupération de mot de passe : Via lien email sur l'interface caisse.

2.5 Tableau de synthèse des accès

Utilisateur

URL d'accès

Identifiants

Interface après connexion

Patron

gco.com

Email + mot de passe

Tableau de bord — desktop/tablette

Vendeur actif

gco.com/caisse

Email + mot de passe

Espace caisse — mobile

Vendeur en attente

gco.com/caisse

Email + mot de passe

Message : « En attente de validation »

Vendeur désactivé

gco.com/caisse

Email + mot de passe

Message : « Votre compte a été désactivé »

1. ESPACE PATRON — TABLEAU DE BORD

Interface optimisée pour ordinateur ou tablette.

Section

Contenu et fonctionnalités

Tableau de bord

CA (jour/semaine/mois), nombre de ventes, valeur du stock (prix d'achat), alertes stock.

Gestion produits

CRUD (Créer, Lire, Mettre à jour, Supprimer). Champs : nom, catégorie, prix achat, prix vente, stock initial, seuil d'alerte.

Catégories

Gestion des catégories (Électronique, Textile, etc.).

Réapprovisionnement

Ajout de quantités au stock après livraison. Tracé dans l'historique.

Annulation vente

Annulation avec remise à niveau automatique du stock. Facture marquée « Annulée ».

Suivi vendeurs

Activation/Désactivation. CA et volume de ventes par vendeur.

Historique ventes

Filtres : période, vendeur, produit, statut. Export CSV.

Mouvements stock

Journal complet des entrées et sorties (date, heure, motif).

Alertes stock

Liste des produits sous le seuil. Badge rouge sur le menu.

1. ESPACE VENDEUR — CAISSE MOBILE

Interface simplifiée, optimisée pour smartphone.

Recherche produit : Par nom ou catégorie. Top 10 des produits fréquents.

Rupture de stock : Les produits à 0 sont grisés et imblocables au panier.

Panier : Calcul du total en temps réel.

Validation : Décrémentation automatique du stock et génération de facture.

Mes ventes du jour : Historique personnel limité à la journée en cours.

1. GÉNÉRATION DE FACTURES

5.1 Contenu de la facture

Numéro unique : FAC-YYYYMMDD-XXXX (ex : FAC-20260328-0042).

Identité : Nom/Logo boutique + Nom du vendeur.

Horodatage : Date et heure précise.

Détails : Liste articles, prix unitaire, sous-totaux et Total général en FCFA.

Mention : « Logiciel de gestion interne — ON AGENCY ».

5.2 Formats

Affichage navigateur : Immédiat après validation.

PDF : Téléchargement direct.

WhatsApp : Lien de partage vers le fichier hébergé (Supabase).

1. GESTION DU STOCK

Décrémentation : Automatique à la vente.

Seuils d'alerte : Paramétrables par produit.

Race condition : En cas de vente simultanée du dernier article, le serveur valide la première requête et rejette la seconde.

Annulation : Réincrémentation automatique du stock si le patron annule une transaction.

1. SPÉCIFICATIONS TECHNIQUES

7.1 Stack technologique

Frontend : React (PWA) — Fonctionnement offline, installable sans store.

Backend/DB : Supabase (PostgreSQL) — Temps réel, Auth, Storage.

Hébergement : Vercel.

PDF : react-pdf.

Offline : IndexedDB + Service Worker.

7.2 Localisation

Langue : Français.

Devise : Franc CFA (FCFA) — Ex : 12 500 FCFA.

Fuseau horaire : Africa/Porto-Novo (UTC+1).

1. PHASES DE DÉVELOPPEMENT

Durée totale estimée : 8 à 10 semaines.

Phase 1 : Authentification (1–2 semaines)

Phase 2 : Produits & Stock (1–2 semaines)

Phase 3 : Caisse & Factures (2 semaines)

Phase 4 : Tableau de Bord (1–2 semaines)

Phase 5 : PWA & Offline (2 semaines)

1. PROCÉDURE DE RECETTE ET VALIDATION

Recette : Environnement de staging pour tests clients.

Délais : 5 jours ouvrés pour retours après chaque phase.

Anomalie vs Évolution : Les corrections d'anomalies sont incluses ; les évolutions hors CDC font l'objet d'un devis séparé.

1. LIVRABLES

Application web déployée.

Code source complet (GitHub).

Guides utilisateurs (Patron et Vendeur).

Session de formation (1h–2h).

Documentation technique (README).

1. CONDITIONS COMMERCIALES

11.1 Paiements

30% à la signature.

40% à la validation de la Phase 3.

30% à la recette finale.

11.2 Propriété

Données : Propriété intégrale du client.

Code source : Propriété du client après paiement final.

1. GLOSSAIRE

Code boutique : Identifiant XXX-0000 pour l'inscription des vendeurs.

Race condition : Conflit d'accès simultané sur un stock limité.

RLS (Row Level Security) : Sécurité native Supabase pour l'isolation des données.

PWA : Web app installable et partiellement utilisable hors ligne.

ON AGENCY — Cotonou, Bénin — 28/03/2026

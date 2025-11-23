Interface d'administration web pour gérer les clients OAuth2/OIDC de Dex sur YunoHost.

Cette application fournit une interface moderne et conviviale pour :
- Voir tous les clients OAuth2/OIDC configurés dans Dex
- Ajouter de nouveaux clients avec des secrets auto-générés ou personnalisés
- Modifier les configurations de clients existants
- Supprimer des clients
- Gérer les URIs de redirection et les pairs de confiance

Tous les changements sont automatiquement appliqués à Dex en régénérant la configuration et en redémarrant le service

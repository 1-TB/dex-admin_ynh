## Prérequis

Cette application nécessite que **Dex** soit installé sur votre instance YunoHost. Si Dex n'est pas installé, l'installation échouera.

Installez d'abord Dex : `yunohost app install dex`

## Accès

Le gestionnaire WebUI Dex est accessible aux administrateurs YunoHost uniquement à votre chemin configuré (par défaut : `/dex-admin`).

## Gestion des clients

### Voir les clients
Tous les clients Dex configurés sont affichés avec leur nom, ID, secret (masqué par défaut), URIs de redirection et pairs de confiance.

### Ajouter un nouveau client
1. Cliquez sur "Ajouter un nouveau client"
2. Remplissez les champs requis (nom de fichier, ID, nom, URIs de redirection)
3. Générez ou saisissez un secret client
4. Ajoutez éventuellement des pairs de confiance ou marquez comme client public
5. Cliquez sur "Créer le client"

### Modifier/Supprimer
Utilisez l'icône crayon pour modifier ou l'icône corbeille pour supprimer un client.

## Comment ça marche

L'application gère les configurations de clients dans `/var/www/dex/config.yaml.d/`, régénère la config Dex et redémarre automatiquement le service Dex.

## Dépannage

- Vérifiez les logs : `journalctl -u dex_webui -n 50`
- Vérifiez le service Dex : `systemctl status dex`
- Vérifiez les permissions : `ls -la /var/www/dex/config.yaml.d/`

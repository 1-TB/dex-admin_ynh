Web-based administration interface for managing Dex OAuth2/OIDC clients on YunoHost.

This application provides a modern, user-friendly interface to:
- View all configured Dex OAuth2/OIDC clients
- Add new clients with auto-generated or custom secrets
- Edit existing client configurations
- Delete clients
- Manage redirect URIs and trusted peers

All changes are automatically applied to Dex by regenerating the configuration and restarting the service

# Dex WebUI Manager for YunoHost

*[Lire ce readme en français.](./README_fr.md)*

> *This package allows you to install Dex WebUI Manager quickly and simply on a YunoHost server.*

## Overview

**Dex WebUI Manager** is a modern web-based administration interface for managing Dex OAuth2/OIDC clients on YunoHost. Instead of manually editing YAML configuration files, this application provides an intuitive UI for managing Dex clients.

### Features

- View all configured OAuth2/OIDC clients
- Add new clients with auto-generated or custom secrets
- Edit existing client configurations
- Delete clients
- Manage redirect URIs and trusted peers
- Show/hide client secrets
- Automatic configuration regeneration and service restart

**Shipped version:** 1.0~ynh1

## Prerequisites

This application **requires Dex to be installed** on your YunoHost instance:

```bash
yunohost app install dex
```

## Installation

Install from YunoHost web admin or via command line:

```bash
yunohost app install dex_webui
```

The application will be accessible to administrators only at `/dex-admin` (or your chosen path).

## How It Works

The application:
1. Manages client YAML files in `/var/www/dex/config.yaml.d/`
2. Automatically regenerates the main Dex configuration
3. Restarts the Dex service to apply changes

All operations are performed through a secure REST API with a React frontend.

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: React (single-page application)
- **Configuration**: YAML files
- **Authentication**: YunoHost SSO (admin-only)

## Documentation

- [Admin documentation](./doc/ADMIN.md)
- [Dex official documentation](https://dexidp.io/docs/)
- [YunoHost Dex package](https://github.com/YunoHost-Apps/dex_ynh)

## Security

- Only YunoHost administrators can access this interface
- Operations require admin authentication via YunoHost SSO
- Client secrets are hidden by default in the UI
- Secure sudo configuration for Dex service management

## License

This package is licensed under MIT. See the LICENSE file for details.

## Links

- Dex official website: <https://dexidp.io>
- YunoHost documentation: <https://yunohost.org>
- Report a bug: Create an issue on this repository

## Developer info

**Architecture:**
```
dex_webui_ynh/
├── sources/
│   ├── backend/     # Node.js/Express API
│   └── frontend/    # React SPA
├── scripts/         # YunoHost installation scripts
├── conf/            # Nginx and systemd configurations
└── doc/             # Documentation
```

**Backend API endpoints:**
- `GET /api/clients` - List all clients
- `GET /api/clients/:filename` - Get client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/:filename` - Update client
- `DELETE /api/clients/:filename` - Delete client
- `POST /api/generate-secret` - Generate random secret

**More info regarding app packaging:** <https://yunohost.org/packaging_apps>

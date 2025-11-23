## Prerequisites

This application requires **Dex** to be installed on your YunoHost instance. If Dex is not installed, the installation will fail.

Install Dex first: `yunohost app install dex`

## Access

The Dex WebUI Manager is accessible to YunoHost administrators only at your configured path (default: `/dex-admin`).

## Managing Clients

### Viewing Clients
All configured Dex clients are displayed with their name, ID, secret (hidden by default), redirect URIs, and trusted peers.

### Adding a New Client
1. Click "Add New Client"
2. Fill in the required fields (filename, ID, name, redirect URIs)
3. Generate or enter a client secret
4. Optionally add trusted peers or mark as public client
5. Click "Create Client"

### Editing/Deleting
Use the pencil icon to edit or trash icon to delete a client.

## How It Works

The app manages client configurations in `/var/www/dex/config.yaml.d/`, regenerates Dex config, and restarts the Dex service automatically.

## Troubleshooting

- Check logs: `journalctl -u dex_webui -n 50`
- Verify Dex service: `systemctl status dex`
- Check permissions: `ls -la /var/www/dex/config.yaml.d/`

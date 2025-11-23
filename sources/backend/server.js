const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;
const DEX_CONFIG_DIR = process.env.DEX_CONFIG_DIR || '/var/www/dex/config.yaml.d';
const DEX_REGENERATE_SCRIPT = process.env.DEX_REGENERATE_SCRIPT || '/var/www/dex/regenerate_config.sh';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Helper function to generate random secret
function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// Helper function to regenerate Dex config and restart service
async function regenerateDexConfig() {
    try {
        // Run the regenerate script
        await execPromise(`bash ${DEX_REGENERATE_SCRIPT}`);

        // Restart Dex service
        await execPromise('sudo systemctl restart dex');

        return { success: true };
    } catch (error) {
        console.error('Error regenerating Dex config:', error);
        throw error;
    }
}

// API Routes

// GET /api/clients - List all clients
app.get('/api/clients', async (req, res) => {
    try {
        const files = await fs.readdir(DEX_CONFIG_DIR);
        const clients = [];

        for (const file of files) {
            const filePath = path.join(DEX_CONFIG_DIR, file);
            const stats = await fs.stat(filePath);

            if (stats.isFile()) {
                const content = await fs.readFile(filePath, 'utf8');
                const parsed = yaml.load(content);

                if (Array.isArray(parsed) && parsed.length > 0) {
                    const client = parsed[0];
                    clients.push({
                        filename: file,
                        id: client.id,
                        name: client.name,
                        redirectURIs: client.redirectURIs || [],
                        secret: client.secret,
                        trustedPeers: client.trustedPeers || [],
                        public: client.public || false
                    });
                }
            }
        }

        res.json({ clients });
    } catch (error) {
        console.error('Error reading clients:', error);
        res.status(500).json({ error: 'Failed to read clients', message: error.message });
    }
});

// GET /api/clients/:filename - Get a specific client
app.get('/api/clients/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(DEX_CONFIG_DIR, filename);

        const content = await fs.readFile(filePath, 'utf8');
        const parsed = yaml.load(content);

        if (Array.isArray(parsed) && parsed.length > 0) {
            res.json({ client: parsed[0] });
        } else {
            res.status(404).json({ error: 'Client not found' });
        }
    } catch (error) {
        console.error('Error reading client:', error);
        res.status(500).json({ error: 'Failed to read client', message: error.message });
    }
});

// POST /api/clients - Create a new client
app.post('/api/clients', async (req, res) => {
    try {
        const { filename, id, name, redirectURIs, secret, trustedPeers, public: isPublic } = req.body;

        // Validate required fields
        if (!filename || !id || !name || !redirectURIs || redirectURIs.length === 0) {
            return res.status(400).json({
                error: 'Missing required fields: filename, id, name, and at least one redirectURI'
            });
        }

        // Generate secret if not provided
        const clientSecret = secret || generateSecret();

        const client = {
            id,
            name,
            redirectURIs,
            secret: clientSecret
        };

        if (trustedPeers && trustedPeers.length > 0) {
            client.trustedPeers = trustedPeers;
        }

        if (isPublic) {
            client.public = true;
        }

        // Write to file
        const filePath = path.join(DEX_CONFIG_DIR, filename);
        const yamlContent = yaml.dump([client]);
        await fs.writeFile(filePath, yamlContent, 'utf8');

        // Set proper permissions (660)
        await fs.chmod(filePath, 0o660);

        // Regenerate config and restart Dex
        await regenerateDexConfig();

        res.json({
            success: true,
            client: { filename, ...client },
            message: 'Client created successfully'
        });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Failed to create client', message: error.message });
    }
});

// PUT /api/clients/:filename - Update an existing client
app.put('/api/clients/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { id, name, redirectURIs, secret, trustedPeers, public: isPublic } = req.body;

        // Validate required fields
        if (!id || !name || !redirectURIs || redirectURIs.length === 0) {
            return res.status(400).json({
                error: 'Missing required fields: id, name, and at least one redirectURI'
            });
        }

        const client = {
            id,
            name,
            redirectURIs,
            secret: secret || generateSecret()
        };

        if (trustedPeers && trustedPeers.length > 0) {
            client.trustedPeers = trustedPeers;
        }

        if (isPublic) {
            client.public = true;
        }

        // Write to file
        const filePath = path.join(DEX_CONFIG_DIR, filename);
        const yamlContent = yaml.dump([client]);
        await fs.writeFile(filePath, yamlContent, 'utf8');

        // Set proper permissions
        await fs.chmod(filePath, 0o660);

        // Regenerate config and restart Dex
        await regenerateDexConfig();

        res.json({
            success: true,
            client: { filename, ...client },
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Failed to update client', message: error.message });
    }
});

// DELETE /api/clients/:filename - Delete a client
app.delete('/api/clients/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(DEX_CONFIG_DIR, filename);

        // Check if file exists
        await fs.access(filePath);

        // Delete the file
        await fs.unlink(filePath);

        // Regenerate config and restart Dex
        await regenerateDexConfig();

        res.json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Failed to delete client', message: error.message });
    }
});

// POST /api/generate-secret - Generate a random secret
app.post('/api/generate-secret', (req, res) => {
    const { length } = req.body;
    const secret = generateSecret(length || 32);
    res.json({ secret });
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        dexConfigDir: DEX_CONFIG_DIR,
        regenerateScript: DEX_REGENERATE_SCRIPT
    });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Dex WebUI Backend running on http://127.0.0.1:${PORT}`);
    console.log(`DEX_CONFIG_DIR: ${DEX_CONFIG_DIR}`);
    console.log(`DEX_REGENERATE_SCRIPT: ${DEX_REGENERATE_SCRIPT}`);
});

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClientForm({ client, onSubmit, onCancel }) {
  const isEditing = !!client;

  const [formData, setFormData] = useState({
    filename: '',
    id: '',
    name: '',
    redirectURIs: [''],
    secret: '',
    trustedPeers: [],
    public: false
  });

  const [trustedPeerInput, setTrustedPeerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (client) {
      setFormData({
        filename: client.filename,
        id: client.id,
        name: client.name,
        redirectURIs: client.redirectURIs || [''],
        secret: client.secret,
        trustedPeers: client.trustedPeers || [],
        public: client.public || false
      });
    }
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRedirectURIChange = (index, value) => {
    const newURIs = [...formData.redirectURIs];
    newURIs[index] = value;
    setFormData(prev => ({ ...prev, redirectURIs: newURIs }));
  };

  const addRedirectURI = () => {
    setFormData(prev => ({
      ...prev,
      redirectURIs: [...prev.redirectURIs, '']
    }));
  };

  const removeRedirectURI = (index) => {
    const newURIs = formData.redirectURIs.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, redirectURIs: newURIs }));
  };

  const addTrustedPeer = () => {
    if (trustedPeerInput.trim()) {
      setFormData(prev => ({
        ...prev,
        trustedPeers: [...prev.trustedPeers, trustedPeerInput.trim()]
      }));
      setTrustedPeerInput('');
    }
  };

  const removeTrustedPeer = (index) => {
    const newPeers = formData.trustedPeers.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, trustedPeers: newPeers }));
  };

  const generateSecret = async () => {
    try {
      const response = await axios.post('/api/generate-secret', { length: 32 });
      setFormData(prev => ({ ...prev, secret: response.data.secret }));
    } catch (err) {
      alert('Failed to generate secret: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.filename || !formData.id || !formData.name) {
        throw new Error('Filename, ID, and Name are required');
      }

      const validURIs = formData.redirectURIs.filter(uri => uri.trim() !== '');
      if (validURIs.length === 0) {
        throw new Error('At least one redirect URI is required');
      }

      const payload = {
        ...formData,
        redirectURIs: validURIs
      };

      if (isEditing) {
        await axios.put(`/api/clients/${formData.filename}`, payload);
      } else {
        await axios.post('/api/clients', payload);
      }

      onSubmit();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title mb-4">
          {isEditing ? 'Edit Client' : 'Create New Client'}
        </h3>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="filename" className="form-label">
              Configuration Filename <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="filename"
              name="filename"
              value={formData.filename}
              onChange={handleInputChange}
              disabled={isEditing}
              required
              placeholder="e.g., myapp"
            />
            <small className="form-text text-muted">
              The filename to store this client configuration (without extension)
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="id" className="form-label">
              Client ID <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              placeholder="e.g., myapp-client"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Client Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., My Application"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Redirect URIs <span className="text-danger">*</span>
            </label>
            {formData.redirectURIs.map((uri, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="url"
                  className="form-control"
                  value={uri}
                  onChange={(e) => handleRedirectURIChange(index, e.target.value)}
                  placeholder="https://myapp.example.com/callback"
                  required
                />
                {formData.redirectURIs.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeRedirectURI(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={addRedirectURI}
            >
              <i className="bi bi-plus"></i> Add Another URI
            </button>
          </div>

          <div className="mb-3">
            <label htmlFor="secret" className="form-label">
              Client Secret <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control font-monospace"
                id="secret"
                name="secret"
                value={formData.secret}
                onChange={handleInputChange}
                required
                placeholder="Leave empty to auto-generate"
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={generateSecret}
              >
                <i className="bi bi-arrow-repeat"></i> Generate
              </button>
            </div>
            <small className="form-text text-muted">
              Click "Generate" to create a random secure secret
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Trusted Peers (Optional)</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={trustedPeerInput}
                onChange={(e) => setTrustedPeerInput(e.target.value)}
                placeholder="e.g., other-client-id"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrustedPeer())}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={addTrustedPeer}
              >
                <i className="bi bi-plus"></i> Add
              </button>
            </div>
            {formData.trustedPeers.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-2">
                {formData.trustedPeers.map((peer, index) => (
                  <span key={index} className="badge bg-info d-flex align-items-center gap-1">
                    {peer}
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      style={{ fontSize: '0.6rem' }}
                      onClick={() => removeTrustedPeer(index)}
                      aria-label="Remove"
                    ></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="public"
                name="public"
                checked={formData.public}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="public">
                Public Client (does not require secret)
              </label>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save"></i> {isEditing ? 'Update' : 'Create'} Client
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientForm;

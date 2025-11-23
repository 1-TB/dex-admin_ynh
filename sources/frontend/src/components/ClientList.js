import React, { useState } from 'react';

function ClientList({ clients, onEdit, onDelete }) {
  const [hiddenSecrets, setHiddenSecrets] = useState(
    clients.reduce((acc, client) => ({ ...acc, [client.filename]: true }), {})
  );

  const toggleSecretVisibility = (filename) => {
    setHiddenSecrets(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="row">
      {clients.map((client) => (
        <div key={client.filename} className="col-md-6 mb-4">
          <div className="card client-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="card-title">{client.name}</h5>
                  <p className="card-text text-muted mb-0">
                    <small>ID: <code>{client.id}</code></small>
                  </p>
                </div>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => onEdit(client)}
                    title="Edit client"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onDelete(client.filename)}
                    title="Delete client"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <strong className="d-block mb-1">Client Secret:</strong>
                <div className="input-group input-group-sm">
                  <input
                    type={hiddenSecrets[client.filename] ? 'password' : 'text'}
                    className="form-control font-monospace"
                    value={client.secret}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => toggleSecretVisibility(client.filename)}
                    title={hiddenSecrets[client.filename] ? 'Show secret' : 'Hide secret'}
                  >
                    <i className={`bi bi-eye${hiddenSecrets[client.filename] ? '' : '-slash'}`}></i>
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => copyToClipboard(client.secret)}
                    title="Copy to clipboard"
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <strong className="d-block mb-1">Redirect URIs:</strong>
                <div className="d-flex flex-wrap gap-1">
                  {client.redirectURIs.map((uri, index) => (
                    <span
                      key={index}
                      className="badge bg-secondary uri-badge"
                      title={uri}
                    >
                      {uri}
                    </span>
                  ))}
                </div>
              </div>

              {client.trustedPeers && client.trustedPeers.length > 0 && (
                <div className="mb-2">
                  <strong className="d-block mb-1">Trusted Peers:</strong>
                  <div className="d-flex flex-wrap gap-1">
                    {client.trustedPeers.map((peer, index) => (
                      <span key={index} className="badge bg-info uri-badge">
                        {peer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {client.public && (
                <div>
                  <span className="badge bg-warning">Public Client</span>
                </div>
              )}

              <div className="mt-3">
                <small className="text-muted">
                  Config file: <code>{client.filename}</code>
                </small>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ClientList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import './App.css';

function App() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/clients');
      setClients(response.data.clients);
      setError(null);
    } catch (err) {
      setError('Failed to load clients: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await axios.delete(`/api/clients/${filename}`);
      await fetchClients();
      alert('Client deleted successfully');
    } catch (err) {
      alert('Failed to delete client: ' + err.message);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingClient(null);
    await fetchClients();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-primary mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-shield-lock"></i> Dex WebUI Manager
          </span>
        </div>
      </nav>

      <div className="container">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : showForm ? (
          <ClientForm
            client={editingClient}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>OAuth2/OIDC Clients</h2>
              <button
                className="btn btn-primary"
                onClick={handleCreateClient}
              >
                <i className="bi bi-plus-circle"></i> Add New Client
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="alert alert-info">
                No clients configured. Click "Add New Client" to create one.
              </div>
            ) : (
              <ClientList
                clients={clients}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

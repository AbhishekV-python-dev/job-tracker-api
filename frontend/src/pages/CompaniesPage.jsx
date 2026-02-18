import { useState, useEffect } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', location: '', website: '' });
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchCompanies();
    }, []);

    async function fetchCompanies() {
        try {
            const res = await client.get('/companies');
            setCompanies(res.data);
        } catch {
            addToast('Failed to load companies', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await client.post('/companies', form);
            addToast('Company created!', 'success');
            setModalOpen(false);
            setForm({ name: '', location: '', website: '' });
            fetchCompanies();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to create company', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="companies-page page-enter">
            <div className="page-header">
                <div>
                    <h1>Companies</h1>
                    <p>Manage your target companies</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    + Add Company
                </button>
            </div>

            {companies.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏢</div>
                    <h3>No companies yet</h3>
                    <p>Add your first company to start tracking job applications</p>
                    <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                        + Add Company
                    </button>
                </div>
            ) : (
                <div className="cards-grid">
                    {companies.map((company) => (
                        <div key={company.id} className="company-card">
                            <div className="company-card-header">
                                <div className="company-avatar">{company.name[0]?.toUpperCase()}</div>
                                <h3>{company.name}</h3>
                            </div>
                            {company.location && (
                                <div className="company-detail">
                                    <span className="detail-icon">📍</span>
                                    <span>{company.location}</span>
                                </div>
                            )}
                            {company.website && (
                                <div className="company-detail">
                                    <span className="detail-icon">🌐</span>
                                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                                        {company.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Company">
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label htmlFor="company-name">Company Name *</label>
                        <input
                            id="company-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Google"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="company-location">Location</label>
                        <input
                            id="company-location"
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="e.g. Mountain View, CA"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="company-website">Website</label>
                        <input
                            id="company-website"
                            type="url"
                            value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            placeholder="https://example.com"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                        {submitting ? <span className="btn-spinner" /> : 'Create Company'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}

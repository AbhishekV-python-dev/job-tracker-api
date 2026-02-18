import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];
const TRANSITIONS = {
    applied: ['interview', 'rejected'],
    interview: ['offer', 'rejected'],
    offer: [],
    rejected: [],
};

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', company_id: '' });
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [sort, setSort] = useState('desc');
    const [page, setPage] = useState(0);
    const [statusDropdown, setStatusDropdown] = useState(null);
    const { addToast } = useToast();

    const LIMIT = 8;

    const fetchJobs = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            params.append('sort', sort);
            params.append('limit', LIMIT);
            params.append('offset', page * LIMIT);

            const res = await client.get(`/jobs?${params.toString()}`);
            setJobs(res.data);
        } catch {
            addToast('Failed to load jobs', 'error');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, sort, page, addToast]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const res = await client.get('/companies');
                setCompanies(res.data);
            } catch {
                // silent
            }
        }
        fetchCompanies();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await client.post('/jobs', {
                title: form.title,
                company_id: parseInt(form.company_id),
            });
            addToast('Job application created!', 'success');
            setModalOpen(false);
            setForm({ title: '', company_id: '' });
            fetchJobs();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to create job', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStatusChange(jobId, newStatus) {
        try {
            await client.patch(`/jobs/${jobId}/status`, { status: newStatus });
            addToast(`Status updated to ${newStatus}`, 'success');
            setStatusDropdown(null);
            fetchJobs();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to update status', 'error');
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
        <div className="jobs-page page-enter">
            <div className="page-header">
                <div>
                    <h1>Job Applications</h1>
                    <p>Track and manage all your applications</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setModalOpen(true)}
                    disabled={companies.length === 0}
                    title={companies.length === 0 ? 'Add a company first' : ''}
                >
                    + Add Application
                </button>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">All</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Sort:</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💼</div>
                    <h3>No applications found</h3>
                    <p>
                        {companies.length === 0
                            ? 'Add a company first, then create your first job application'
                            : 'Create your first job application to start tracking'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="jobs-table-wrapper">
                        <table className="jobs-table">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Company</th>
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td className="job-title-cell">{job.title}</td>
                                        <td>
                                            <span className="company-tag">{job.company?.name}</span>
                                        </td>
                                        <td>
                                            <div className="status-cell">
                                                <span
                                                    className={`status-badge status-${job.status} ${TRANSITIONS[job.status]?.length > 0 ? 'clickable' : ''
                                                        }`}
                                                    onClick={() => {
                                                        if (TRANSITIONS[job.status]?.length > 0) {
                                                            setStatusDropdown(statusDropdown === job.id ? null : job.id);
                                                        }
                                                    }}
                                                >
                                                    {job.status}
                                                    {TRANSITIONS[job.status]?.length > 0 && ' ▾'}
                                                </span>
                                                {statusDropdown === job.id && (
                                                    <div className="status-dropdown">
                                                        {TRANSITIONS[job.status].map((s) => (
                                                            <button
                                                                key={s}
                                                                className={`status-option status-${s}`}
                                                                onClick={() => handleStatusChange(job.id, s)}
                                                            >
                                                                Move to {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(job.applied_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            className="btn btn-ghost"
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            ← Previous
                        </button>
                        <span className="page-indicator">Page {page + 1}</span>
                        <button
                            className="btn btn-ghost"
                            disabled={jobs.length < LIMIT}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Job Application">
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label htmlFor="job-title">Job Title *</label>
                        <input
                            id="job-title"
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Software Engineer"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="job-company">Company *</label>
                        <select
                            id="job-company"
                            value={form.company_id}
                            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                            required
                        >
                            <option value="">Select a company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                        {submitting ? <span className="btn-spinner" /> : 'Create Application'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}

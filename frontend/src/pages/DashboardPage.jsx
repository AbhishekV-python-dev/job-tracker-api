import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function DashboardPage() {
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const [jobsRes, companiesRes] = await Promise.all([
                    client.get('/jobs?limit=100'),
                    client.get('/companies'),
                ]);
                setJobs(jobsRes.data);
                setCompanies(companiesRes.data);
            } catch {
                // handled by interceptor
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const stats = {
        total: jobs.length,
        applied: jobs.filter((j) => j.status === 'applied').length,
        interview: jobs.filter((j) => j.status === 'interview').length,
        offer: jobs.filter((j) => j.status === 'offer').length,
        rejected: jobs.filter((j) => j.status === 'rejected').length,
        companies: companies.length,
    };

    const recentJobs = [...jobs]
        .sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="dashboard-page page-enter">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Track your job application progress</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Applications</span>
                    </div>
                </div>
                <div className="stat-card stat-applied">
                    <div className="stat-icon">📤</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.applied}</span>
                        <span className="stat-label">Applied</span>
                    </div>
                </div>
                <div className="stat-card stat-interview">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.interview}</span>
                        <span className="stat-label">Interview</span>
                    </div>
                </div>
                <div className="stat-card stat-offer">
                    <div className="stat-icon">🎉</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.offer}</span>
                        <span className="stat-label">Offers</span>
                    </div>
                </div>
                <div className="stat-card stat-rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.rejected}</span>
                        <span className="stat-label">Rejected</span>
                    </div>
                </div>
                <div className="stat-card stat-companies">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.companies}</span>
                        <span className="stat-label">Companies</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-actions">
                <button className="btn btn-primary" onClick={() => navigate('/companies')}>
                    + Add Company
                </button>
                <button className="btn btn-accent" onClick={() => navigate('/jobs')}>
                    + Add Job
                </button>
            </div>

            <div className="recent-section">
                <h2>Recent Applications</h2>
                {recentJobs.length === 0 ? (
                    <div className="empty-state">
                        <p>No applications yet. Start by adding a company, then create your first job application!</p>
                    </div>
                ) : (
                    <div className="recent-list">
                        {recentJobs.map((job) => (
                            <div key={job.id} className="recent-item">
                                <div className="recent-item-info">
                                    <span className="recent-item-title">{job.title}</span>
                                    <span className="recent-item-company">{job.company?.name}</span>
                                </div>
                                <div className="recent-item-meta">
                                    <span className={`status-badge status-${job.status}`}>{job.status}</span>
                                    <span className="recent-item-date">
                                        {new Date(job.applied_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

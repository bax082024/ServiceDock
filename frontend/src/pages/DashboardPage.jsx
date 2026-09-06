import { useEffect, useState } from 'react';

import {
    getDashboardSummary,
    subscribeToDashboardEvents
} from '../services/api';

import ServiceCard from '../components/ServiceCard';

function DashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadDashboard() {
        try {
            const data = await getDashboardSummary();

            setDashboard(data);
            setError(null);

        } catch (error) {
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();

        const unsubscribe =
            subscribeToDashboardEvents(
                () => {
                    loadDashboard();
                },
                () => {
                    console.warn(
                        'Dashboard live connection interrupted'
                    );
                }
            );

        const fallbackInterval =
            setInterval(() => {
                loadDashboard();
            }, 30000);

        return () => {
            unsubscribe();
            clearInterval(fallbackInterval);
        };
    }, []);

    if (loading) {
        return (
            <p className="message">
                Loading dashboard...
            </p>
        );
    }

    if (error) {
        return (
            <p className="message error">
                Error: {error}
            </p>
        );
    }

    const {
        overview,
        services,
        recentActivity
    } = dashboard;

    return (
        <>
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">
                        SERVICE MONITORING
                    </p>

                    <h2>Dashboard</h2>

                    <p className="subtitle">
                        Monitor the health and performance
                        of your services.
                    </p>
                </div>

                <div className="monitor-status">
                    <span className="system-dot"></span>
                    Live monitoring
                </div>
            </header>

            <section className="overview-grid">
                <div className="overview-card">
                    <span>Total services</span>

                    <strong>
                        {overview.totalServices}
                    </strong>
                </div>

                <div className="overview-card">
                    <span>Healthy</span>

                    <strong>
                        {overview.healthyServices}
                    </strong>
                </div>

                <div className="overview-card">
                    <span>Failing</span>

                    <strong>
                        {overview.failingServices}
                    </strong>
                </div>

                <div className="overview-card">
                    <span>Active incidents</span>

                    <strong>
                        {overview.activeIncidents}
                    </strong>
                </div>
            </section>

            <section className="services-section">
                <div className="section-heading">
                    <div>
                        <h3>Monitored Services</h3>

                        <p>
                            Current service health and
                            performance.
                        </p>
                    </div>
                </div>

                <div className="services-grid">
                    {services.map(service => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                        />
                    ))}
                </div>
            </section>

            <section className="dashboard-secondary-grid">
                <div className="dashboard-panel">
                    <div className="section-heading">
                        <div>
                            <h3>System Overview</h3>

                            <p>
                                Overall monitoring statistics.
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-stat-list">
                        <div>
                            <span>Average uptime</span>

                            <strong>
                                {overview.averageUptime}%
                            </strong>
                        </div>

                        <div>
                            <span>Total incidents</span>

                            <strong>
                                {overview.totalIncidents}
                            </strong>
                        </div>

                        <div>
                            <span>Paused services</span>

                            <strong>
                                {overview.pausedServices}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div className="section-heading">
                        <div>
                            <h3>Recent Activity</h3>

                            <p>
                                Latest incidents and recoveries.
                            </p>
                        </div>
                    </div>

                    <div className="activity-list">
                        {recentActivity.map(activity => (
                            <div
                                className="activity-row"
                                key={
                                    `${activity.type}-${activity.incident_id}`
                                }
                            >
                                <span
                                    className={
                                        `activity-dot ${activity.type}`
                                    }
                                ></span>

                                <div className="activity-content">
                                    <strong>
                                        {activity.service_name}
                                    </strong>

                                    <span>
                                        {activity.type ===
                                        'incident_started'
                                            ? 'Incident started'
                                            : 'Service recovered'}
                                    </span>
                                </div>

                                <time>
                                    {new Date(
                                        activity.event_at
                                    ).toLocaleString()}
                                </time>
                            </div>
                        ))}

                        {recentActivity.length === 0 && (
                            <div className="empty-state">
                                No recent activity.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

export default DashboardPage;
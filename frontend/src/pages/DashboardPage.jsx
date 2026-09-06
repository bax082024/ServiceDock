import { useEffect, useState } from 'react';

import {
    getDashboardSummary
} from '../services/api';

import {
    useServiceDock
} from '../context/ServiceDockContext';

import ServiceCard from '../components/ServiceCard';

let cachedDashboard = null;

function DashboardPage() {
    const [dashboard, setDashboard] =
    useState(cachedDashboard);

    const [loading, setLoading] =
        useState(cachedDashboard === null);
    const [error, setError] = useState(null);
    const {
        connectionStatus,
        latestServiceCheck
    } = useServiceDock();

    async function loadDashboard(showError = false) {
        try {
            const data = await getDashboardSummary();

            cachedDashboard = data;

            setDashboard(data);
            setError(null);

        } catch (error) {
            if (!dashboard && !cachedDashboard) {
                setError(error.message);
            } else {
                console.warn(
                    'Dashboard refresh failed:',
                    error.message
                );
            }

        } finally {
            if (showError) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        loadDashboard(true);

        const fallbackInterval =
            setInterval(() => {
                loadDashboard(false);
            }, 30000);

        return () => {
            clearInterval(fallbackInterval);
        };
    }, []);

    useEffect(() => {
        if (!latestServiceCheck) {
            return;
        }

        loadDashboard(false);
    }, [latestServiceCheck]);

    if (loading) {
        return (
            <p className="message">
                Loading dashboard...
            </p>
        );
    }

    if (error && !dashboard) {
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

                <div
                    className={
                        `monitor-status ${connectionStatus}`
                    }
                >
                    <span className="system-dot"></span>

                    {connectionStatus === 'connected' &&
                        'Live connected'}

                    {connectionStatus === 'connecting' &&
                        'Connecting...'}

                    {connectionStatus === 'reconnecting' &&
                        'Reconnecting...'}

                    {connectionStatus === 'disconnected' &&
                        'Disconnected'}
                </div>
            </header>

            {connectionStatus !== 'connected' && dashboard && (
                <div className="dashboard-warning">
                    Showing last known data while the live connection
                    is unavailable.
                </div>
            )}

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
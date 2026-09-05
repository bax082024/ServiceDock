import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
    getService,
    getServiceStats,
    getServiceChecks,
    getServiceIncidents
} from '../services/api';

function ServiceDetailsPage() {
    const { id } = useParams();

    const [service, setService] = useState(null);
    const [stats, setStats] = useState(null);
    const [checks, setChecks] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadServiceDetails() {
            try {
                const [
                    serviceData,
                    statsData,
                    checksData,
                    incidentsData
                ] = await Promise.all([
                    getService(id),
                    getServiceStats(id),
                    getServiceChecks(id),
                    getServiceIncidents(id)
                ]);

                setService(serviceData);
                setStats(statsData.stats);
                setChecks(checksData.checks);
                setIncidents(incidentsData.incidents);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadServiceDetails();
    }, [id]);

    if (loading) {
        return (
            <p className="message">
                Loading service details...
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

    const allTime = stats?.allTime;
    const incidentStats = stats?.incidents;

    return (
        <>
            <Link
                to="/"
                className="back-link"
            >
                ← Back to dashboard
            </Link>

            <header className="service-details-header">
                <div>
                    <p className="eyebrow">
                        SERVICE DETAILS
                    </p>

                    <div className="details-title">
                        <span
                            className={`status-dot ${service.status}`}
                        ></span>

                        <h2>{service.name}</h2>
                    </div>

                    <p className="subtitle">
                        {service.url}
                    </p>
                </div>

                <span
                    className={`status-badge ${service.status}`}
                >
                    {service.status}
                </span>
            </header>

            <section className="details-overview">
                <div className="overview-card">
                    <span>All-time uptime</span>
                    <strong>
                        {allTime?.uptimePercentage ?? 0}%
                    </strong>
                </div>

                <div className="overview-card">
                    <span>Average response</span>
                    <strong>
                        {allTime?.responseTime?.averageMs ?? 'N/A'}
                        {allTime?.responseTime?.averageMs != null
                            ? ' ms'
                            : ''}
                    </strong>
                </div>

                <div className="overview-card">
                    <span>Total incidents</span>
                    <strong>
                        {incidentStats?.totalIncidents ?? 0}
                    </strong>
                </div>

                <div className="overview-card">
                    <span>Active incidents</span>
                    <strong>
                        {incidentStats?.activeIncidents ?? 0}
                    </strong>
                </div>
            </section>

            <section className="details-section">
                <div className="section-heading">
                    <h3>Uptime</h3>
                    <p>
                        Availability across different monitoring periods.
                    </p>
                </div>

                <div className="uptime-grid">
                    <div>
                        <span>Last 24 hours</span>
                        <strong>
                            {stats?.last24Hours?.uptimePercentage ?? 0}%
                        </strong>
                    </div>

                    <div>
                        <span>Last 7 days</span>
                        <strong>
                            {stats?.last7Days?.uptimePercentage ?? 0}%
                        </strong>
                    </div>

                    <div>
                        <span>Last 30 days</span>
                        <strong>
                            {stats?.last30Days?.uptimePercentage ?? 0}%
                        </strong>
                    </div>

                    <div>
                        <span>All time</span>
                        <strong>
                            {allTime?.uptimePercentage ?? 0}%
                        </strong>
                    </div>
                </div>
            </section>

            <section className="details-section">
                <div className="section-heading">
                    <h3>Recent Checks</h3>
                    <p>
                        Latest monitoring results for this service.
                    </p>
                </div>

                <div className="checks-list">
                    {checks.slice(0, 10).map(check => (
                        <div
                            className="check-row"
                            key={check.id}
                        >
                            <span
                                className={`status-dot ${check.status}`}
                            ></span>

                            <strong>{check.status}</strong>

                            <span>
                                {check.response_time_ms != null
                                    ? `${check.response_time_ms} ms`
                                    : 'N/A'}
                            </span>

                            <span>
                                {new Date(
                                    check.checked_at
                                ).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="details-section">
                <div className="section-heading">
                    <h3>Incident History</h3>
                    <p>
                        Recorded outages and recoveries.
                    </p>
                </div>

                <div className="incidents-list">
                    {incidents.length === 0 && (
                        <p className="empty-state">
                            No incidents recorded.
                        </p>
                    )}

                    {incidents.map(incident => (
                        <div
                            className="incident-row"
                            key={incident.id}
                        >
                            <span
                                className={`incident-status ${incident.status}`}
                            >
                                {incident.status}
                            </span>

                            <span>
                                Started:{' '}
                                {new Date(
                                    incident.startedAt
                                ).toLocaleString()}
                            </span>

                            <strong>
                                {incident.durationSeconds} sec
                            </strong>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default ServiceDetailsPage;
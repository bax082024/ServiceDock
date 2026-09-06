import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponseTimeChart from '../components/ResponseTimeChart';
import EditServiceModal from '../components/EditServiceModal';

import {
    getService,
    getServiceStats,
    getServiceChecks,
    getServiceIncidents,
    checkService
} from '../services/api';

function ServiceDetailsPage() {
    const { id } = useParams();

    const [service, setService] = useState(null);
    const [stats, setStats] = useState(null);
    const [checks, setChecks] = useState([]);
    const [incidents, setIncidents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [checking, setChecking] = useState(false);
    const [checkError, setCheckError] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);

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

            setError(null);

        } catch (error) {
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadServiceDetails();

        const interval = setInterval(() => {
            loadServiceDetails();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [id]);

    async function handleCheckNow() {
        try {
            setChecking(true);
            setCheckError(null);

            await checkService(id);

            await loadServiceDetails();

        } catch (error) {
            setCheckError(error.message);

        } finally {
            setChecking(false);
        }
    }

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

                <div className="service-detail-actions">
                    <span
                        className={`status-badge ${service.status}`}
                    >
                        {service.status}
                    </span>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={handleCheckNow}
                        disabled={checking}
                    >
                        {checking
                            ? 'Checking...'
                            : 'Check Now'}
                    </button>
                </div>
            </header>

            {checkError && (
                <p className="form-error">
                    {checkError}
                </p>
            )}

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
                    <h3>Monitoring</h3>

                    <p>
                        Current monitoring configuration for this service.
                    </p>
                </div>

                <div className="monitoring-details-card">
                    <div className="monitoring-details-row">
                        <div>
                            <span>Automatic monitoring</span>

                            <strong>
                                {service.monitoring_enabled
                                    ? 'Active'
                                    : 'Paused'}
                            </strong>
                        </div>

                        <div className="monitoring-details-actions">
                            <span
                                className={
                                    service.monitoring_enabled
                                        ? 'monitoring-state active'
                                        : 'monitoring-state paused'
                                }
                            >
                                {service.monitoring_enabled
                                    ? 'ACTIVE'
                                    : 'PAUSED'}
                            </span>

                            <button
                                className="service-action-button"
                                type="button"
                                onClick={() => setShowEditModal(true)}
                            >
                                Edit settings
                            </button>
                        </div>
                    </div>

                    <div className="monitoring-details-grid">
                        <div>
                            <span>Check interval</span>

                            <strong>
                                {service.check_interval_seconds} seconds
                            </strong>
                        </div>

                        <div>
                            <span>Request timeout</span>

                            <strong>
                                {service.timeout_ms} ms
                            </strong>
                        </div>

                        <div>
                            <span>Slow response threshold</span>

                            <strong>
                                {service.slow_threshold_ms} ms
                            </strong>
                        </div>
                    </div>
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
                    <h3>Response Time</h3>

                    <p>
                        Response-time history from recent monitoring checks.
                    </p>
                </div>

                <ResponseTimeChart checks={checks} />
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

                            <strong>
                                {check.status}
                            </strong>

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
                                className={
                                    `incident-status ${incident.status}`
                                }
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
            {showEditModal && (
                <EditServiceModal
                    service={service}
                    onClose={() => setShowEditModal(false)}
                    onServiceUpdated={loadServiceDetails}
                />
            )}

        </>
    );
}

export default ServiceDetailsPage;
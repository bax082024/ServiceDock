import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    getIncidents
} from '../services/api';

import {
    useServiceDock
} from '../context/ServiceDockContext';

function IncidentsPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        latestServiceCheck
    } = useServiceDock();

    async function loadIncidents() {
        try {
            const data = await getIncidents();

            setIncidents(data.incidents);
            setError(null);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadIncidents();

        const fallbackInterval =
            setInterval(() => {
                loadIncidents();
            }, 30000);

        return () => {
            clearInterval(fallbackInterval);
        };
    }, []);

    useEffect(() => {
        if (!latestServiceCheck) {
            return;
        }

        loadIncidents();
    }, [latestServiceCheck]);

    const activeIncidents = incidents.filter(
        incident => incident.status === 'active'
    ).length;

    const resolvedIncidents = incidents.filter(
        incident => incident.status === 'resolved'
    ).length;

    return (
        <>
            <header className="page-header">
                <div>
                    <p className="eyebrow">
                        INCIDENT MANAGEMENT
                    </p>

                    <h2>Incidents</h2>

                    <p className="subtitle">
                        Review service outages and recoveries.
                    </p>
                </div>
            </header>

            {loading && (
                <p className="message">
                    Loading incidents...
                </p>
            )}

            {error && (
                <p className="message error">
                    Error: {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    <section className="details-overview">
                        <div className="overview-card">
                            <span>Total incidents</span>
                            <strong>{incidents.length}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Active incidents</span>
                            <strong>{activeIncidents}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Resolved incidents</span>
                            <strong>{resolvedIncidents}</strong>
                        </div>
                    </section>

                    <section className="details-section">
                        <div className="section-heading">
                            <h3>Incident History</h3>

                            <p>
                                Outages across all monitored services.
                            </p>
                        </div>

                        <div className="global-incidents-list">
                            {incidents.length === 0 && (
                                <p className="empty-state">
                                    No incidents recorded.
                                </p>
                            )}

                            {incidents.map(incident => (
                                <div
                                    className="global-incident-row"
                                    key={incident.id}
                                >
                                    <div className="incident-service">
                                        <span
                                            className={
                                                `incident-status ${incident.status}`
                                            }
                                        >
                                            {incident.status}
                                        </span>

                                        <div>
                                            <Link
                                                to={
                                                    `/services/${incident.serviceId}`
                                                }
                                                className="incident-service-link"
                                            >
                                                {incident.serviceName}
                                            </Link>

                                            <p>
                                                {incident.serviceUrl}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="incident-time">
                                        <span>Started</span>

                                        <strong>
                                            {new Date(
                                                incident.startedAt
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="incident-duration">
                                        <span>Duration</span>

                                        <strong>
                                            {incident.durationSeconds} sec
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </>
    );
}

export default IncidentsPage;
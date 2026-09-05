import { useEffect, useState } from 'react';

import {
    getServices,
    getServiceStats
} from '../services/api';

import ServiceCard from '../components/ServiceCard';

function DashboardPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadServices() {
            try {
                const data = await getServices();

                const servicesWithStats = await Promise.all(
                    data.map(async service => {
                        const stats = await getServiceStats(
                            service.id
                        );

                        return {
                            ...service,
                            stats: stats.stats
                        };
                    })
                );

                setServices(servicesWithStats);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, []);

    const healthyServices = services.filter(
        service => service.status === 'healthy'
    ).length;

    const failingServices =
        services.length - healthyServices;

    const activeIncidents = services.reduce(
        (total, service) =>
            total +
            (service.stats?.incidents?.activeIncidents ?? 0),
        0
    );

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

            {loading && (
                <p className="message">
                    Loading services...
                </p>
            )}

            {error && (
                <p className="message error">
                    Error: {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    <section className="overview-grid">
                        <div className="overview-card">
                            <span>Total services</span>
                            <strong>{services.length}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Healthy</span>
                            <strong>{healthyServices}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Failing</span>
                            <strong>{failingServices}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Active incidents</span>
                            <strong>{activeIncidents}</strong>
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
                </>
            )}
        </>
    );
}

export default DashboardPage;
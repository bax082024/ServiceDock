import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getServices } from '../services/api';

function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadServices() {
            try {
                const data = await getServices();

                setServices(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, []);

    return (
        <>
            <header className="page-header">
                <div>
                    <p className="eyebrow">
                        SERVICE MANAGEMENT
                    </p>

                    <h2>Services</h2>

                    <p className="subtitle">
                        Manage all monitored services.
                    </p>
                </div>

                <button
                    className="primary-button"
                    type="button"
                >
                    + Add Service
                </button>
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
                <section className="services-management">
                    <div className="management-heading">
                        <div>
                            <h3>Monitored Services</h3>

                            <p>
                                {services.length} service
                                {services.length !== 1 ? 's' : ''}{' '}
                                registered
                            </p>
                        </div>
                    </div>

                    <div className="management-list">
                        {services.map(service => (
                            <div
                                className="management-row"
                                key={service.id}
                            >
                                <div className="management-service">
                                    <span
                                        className={
                                            `status-dot ${service.status}`
                                        }
                                    ></span>

                                    <div>
                                        <h4>{service.name}</h4>
                                        <p>{service.url}</p>
                                    </div>
                                </div>

                                <span
                                    className={
                                        `status-badge ${service.status}`
                                    }
                                >
                                    {service.status}
                                </span>

                                <div className="management-actions">
                                    <Link
                                        to={`/services/${service.id}`}
                                        className="secondary-button"
                                    >
                                        View
                                    </Link>

                                    <button
                                        className="secondary-button"
                                        type="button"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}

                        {services.length === 0 && (
                            <div className="empty-state">
                                No services registered yet.
                            </div>
                        )}
                    </div>
                </section>
            )}
        </>
    );
}

export default ServicesPage;
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EditServiceModal from '../components/EditServiceModal';
import DeleteServiceModal from '../components/DeleteServiceModal';

import {
    createService,
    getServices
} from '../services/api';

import {
    useServiceDock
} from '../context/ServiceDockContext';

function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingService, setEditingService] = useState(null);
    const [deletingService, setDeletingService] = useState(null);

    const {
        latestServiceCheck
    } = useServiceDock();

    const [showAddForm, setShowAddForm] = useState(false);

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    async function loadServices() {
        try {
            const data = await getServices();

            setServices(data);
            setError(null);

        } catch (error) {
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadServices();

        const fallbackInterval =
            setInterval(() => {
                loadServices();
            }, 30000);

        return () => {
            clearInterval(fallbackInterval);
        };
    }, []);

    useEffect(() => {
        if (!latestServiceCheck) {
            return;
        }

        loadServices();
    }, [latestServiceCheck]);

    async function handleAddService(event) {
        event.preventDefault();

        setSaving(true);
        setFormError(null);

        try {
            await createService({
                name,
                url
            });

            setName('');
            setUrl('');
            setShowAddForm(false);

            await loadServices();

        } catch (error) {
            setFormError(error.message);

        } finally {
            setSaving(false);
        }
    }

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
                    onClick={() =>
                        setShowAddForm(!showAddForm)
                    }
                >
                    {showAddForm
                        ? 'Cancel'
                        : '+ Add Service'}
                </button>
            </header>

            {showAddForm && (
                <section className="add-service-panel">
                    <div className="section-heading">
                        <h3>Add Service</h3>

                        <p>
                            Register a new service for monitoring.
                        </p>
                    </div>

                    <form
                        className="service-form"
                        onSubmit={handleAddService}
                    >
                        <div className="form-field">
                            <label htmlFor="service-name">
                                Name
                            </label>

                            <input
                                id="service-name"
                                type="text"
                                value={name}
                                onChange={event =>
                                    setName(event.target.value)
                                }
                                placeholder="Example API"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="service-url">
                                URL
                            </label>

                            <input
                                id="service-url"
                                type="text"
                                value={url}
                                onChange={event =>
                                    setUrl(event.target.value)
                                }
                                placeholder="http://example-service"
                            />
                        </div>

                        {formError && (
                            <p className="form-error">
                                {formError}
                            </p>
                        )}

                        <div className="form-actions">
                            <button
                                className="primary-button"
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Adding...'
                                    : 'Add Service'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

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

                                    <div className="management-service-content">
                                        <h4>{service.name}</h4>

                                        <p className="management-service-url">
                                            {service.url}
                                        </p>

                                        {service.monitoring_enabled ? (
                                            <div className="monitoring-summary">
                                                <span>
                                                    Every {service.check_interval_seconds}s
                                                </span>

                                                <span className="summary-separator">
                                                    •
                                                </span>

                                                <span>
                                                    Timeout {service.timeout_ms}ms
                                                </span>

                                                <span className="summary-separator">
                                                    •
                                                </span>

                                                <span>
                                                    Slow &gt; {service.slow_threshold_ms}ms
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="monitoring-summary paused">
                                                <span className="paused-dot"></span>
                                                Automatic monitoring paused
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="service-status-badges">
                                    <span
                                        className={
                                            `status-badge ${service.status}`
                                        }
                                    >
                                        {service.status}
                                    </span>

                                    {!service.monitoring_enabled && (
                                        <span className="monitoring-badge paused">
                                            PAUSED
                                        </span>
                                    )}
                                </div>

                                <div className="management-actions">
                                    <Link
                                        to={`/services/${service.id}`}
                                        className="secondary-button"
                                    >
                                        View
                                    </Link>

                                    <button
                                        className="service-action-button"
                                        type="button"
                                        onClick={() =>
                                            setEditingService(service)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-action-button"
                                        type="button"
                                        onClick={() =>
                                            setDeletingService(service)
                                        }
                                    >
                                        Delete
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

            {editingService && (
                <EditServiceModal
                    service={editingService}
                    onClose={() =>
                        setEditingService(null)
                    }
                    onServiceUpdated={loadServices}
                />
            )}
            {deletingService && (
                <DeleteServiceModal
                    service={deletingService}
                    onClose={() => setDeletingService(null)}
                    onServiceDeleted={loadServices}
                />
            )}
        </>
    );
}

export default ServicesPage;
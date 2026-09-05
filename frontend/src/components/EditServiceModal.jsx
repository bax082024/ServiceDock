import { useState } from 'react';

import { updateService } from '../services/api';

function EditServiceModal({
    service,
    onClose,
    onServiceUpdated
}) {
    const [name, setName] = useState(service.name);
    const [url, setUrl] = useState(service.url);

    const [monitoringEnabled, setMonitoringEnabled] =
        useState(Boolean(service.monitoring_enabled));

    const [checkIntervalSeconds, setCheckIntervalSeconds] =
        useState(service.check_interval_seconds ?? 30);

    const [timeoutMs, setTimeoutMs] =
        useState(service.timeout_ms ?? 5000);

    const [slowThresholdMs, setSlowThresholdMs] =
        useState(service.slow_threshold_ms ?? 500);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            await updateService(
                service.id,
                {
                    name,
                    url,
                    monitoring_enabled: monitoringEnabled,
                    check_interval_seconds:
                        Number(checkIntervalSeconds),
                    timeout_ms:
                        Number(timeoutMs),
                    slow_threshold_ms:
                        Number(slowThresholdMs)
                }
            );

            await onServiceUpdated();

            onClose();

        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
        >
            <div
                className="service-modal"
                onClick={event => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <p className="eyebrow">
                            SERVICE MANAGEMENT
                        </p>

                        <h3>Edit Service</h3>
                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                        type="button"
                        disabled={saving}
                    >
                        ×
                    </button>
                </div>

                <form
                    className="service-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Service name

                        <input
                            type="text"
                            value={name}
                            onChange={event =>
                                setName(event.target.value)
                            }
                            disabled={saving}
                        />
                    </label>

                    <label>
                        Service URL

                        <input
                            type="text"
                            value={url}
                            onChange={event =>
                                setUrl(event.target.value)
                            }
                            disabled={saving}
                        />
                    </label>

                    <div className="monitoring-settings">
                        <div className="monitoring-setting-row">
                            <div>
                                <strong>
                                    Automatic monitoring
                                </strong>

                                <p>
                                    Enable scheduled health checks
                                    for this service.
                                </p>
                            </div>

                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={monitoringEnabled}
                                    onChange={event =>
                                        setMonitoringEnabled(
                                            event.target.checked
                                        )
                                    }
                                    disabled={saving}
                                />

                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <label>
                            Check interval

                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={checkIntervalSeconds}
                                    onChange={event =>
                                        setCheckIntervalSeconds(
                                            event.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                                <span>seconds</span>
                            </div>
                        </label>

                        <label>
                            Request timeout

                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={timeoutMs}
                                    onChange={event =>
                                        setTimeoutMs(
                                            event.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                                <span>ms</span>
                            </div>
                        </label>

                        <label>
                            Slow response threshold

                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={slowThresholdMs}
                                    onChange={event =>
                                        setSlowThresholdMs(
                                            event.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                                <span>ms</span>
                            </div>
                        </label>
                    </div>

                    {error && (
                        <p className="form-error">
                            {error}
                        </p>
                    )}

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditServiceModal;
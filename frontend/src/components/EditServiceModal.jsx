import { useState } from 'react';

import { updateService } from '../services/api';

function EditServiceModal({
    service,
    onClose,
    onServiceUpdated
}) {
    const [name, setName] = useState(service.name);
    const [url, setUrl] = useState(service.url);
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
                    url
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
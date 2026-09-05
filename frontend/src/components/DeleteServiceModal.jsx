import { useState } from 'react';

import { deleteService } from '../services/api';

function DeleteServiceModal({
    service,
    onClose,
    onServiceDeleted
}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    async function handleDelete() {
        try {
            setDeleting(true);
            setError(null);

            await deleteService(service.id);

            await onServiceDeleted();

            onClose();

        } catch (error) {
            setError(error.message);
        } finally {
            setDeleting(false);
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

                        <h3>Delete Service</h3>
                    </div>

                    <button
                        className="modal-close"
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        ×
                    </button>
                </div>

                <div className="delete-service-content">
                    <p>
                        Are you sure you want to delete{' '}
                        <strong>{service.name}</strong>?
                    </p>

                    <p className="delete-warning">
                        This will permanently remove the service
                        and its monitoring history.
                    </p>

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
                            disabled={deleting}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="danger-button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? 'Deleting...'
                                : 'Delete Service'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteServiceModal;
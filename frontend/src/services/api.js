const API_URL = 'http://localhost:3000';

export async function getServices() {
    const response = await fetch(
        `${API_URL}/services`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load services'
        );
    }

    return response.json();
}

export async function getDashboardSummary() {
    const response = await fetch(
        `${API_URL}/dashboard/summary`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load dashboard summary'
        );
    }

    return response.json();
}

export async function getServiceStats(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/stats`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load service stats'
        );
    }

    return response.json();
}

export async function getServiceIncidents(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/incidents`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load service incidents'
        );
    }

    return response.json();
}

export async function getService(id) {
    const response = await fetch(
        `${API_URL}/services/${id}`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load service'
        );
    }

    return response.json();
}

export async function getServiceChecks(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/checks`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load service checks'
        );
    }

    return response.json();
}

export async function createService(service) {
    const response = await fetch(
        `${API_URL}/services`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(service)
        }
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message ||
            'Failed to create service'
        );
    }

    return response.json();
}

export async function getIncidents() {
    const response = await fetch(
        `${API_URL}/incidents`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load incidents'
        );
    }

    return response.json();
}

export async function updateService(
    id,
    service
) {
    const response = await fetch(
        `${API_URL}/services/${id}`,
        {
            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(service)
        }
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message ||
            'Failed to update service'
        );
    }

    return response.json();
}

export async function deleteService(id) {
    const response = await fetch(
        `${API_URL}/services/${id}`,
        {
            method: 'DELETE'
        }
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message ||
            'Failed to delete service'
        );
    }

    return response.json();
}

export async function checkService(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/check`,
        {
            method: 'POST'
        }
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message ||
            'Failed to check service'
        );
    }

    return response.json();
}

export async function getNotifications() {
    const response = await fetch(
        `${API_URL}/notifications`
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load notifications'
        );
    }

    return response.json();
}

export async function markAllNotificationsRead() {
    const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
            method: 'PUT'
        }
    );

    if (!response.ok) {
        throw new Error(
            'Failed to mark notifications as read'
        );
    }

    return response.json();
}

export function subscribeToDashboardEvents({
    onServiceCheck,
    onIncidentStarted,
    onIncidentResolved,
    onNotificationCreated,
    onOpen,
    onError
}) {
    const eventSource =
        new EventSource(
            `${API_URL}/events`
        );

    eventSource.onopen = () => {
        if (onOpen) {
            onOpen();
        }
    };

    eventSource.addEventListener(
        'service-check',
        event => {
            const data =
                JSON.parse(event.data);

            if (onServiceCheck) {
                onServiceCheck(data);
            }
        }
    );

    eventSource.addEventListener(
        'incident-started',
        event => {
            const data =
                JSON.parse(event.data);

            if (onIncidentStarted) {
                onIncidentStarted(data);
            }
        }
    );

    eventSource.addEventListener(
        'incident-resolved',
        event => {
            const data =
                JSON.parse(event.data);

            if (onIncidentResolved) {
                onIncidentResolved(data);
            }
        }
    );

    eventSource.addEventListener(
        'notification-created',
        event => {
            const data =
                JSON.parse(event.data);

            if (onNotificationCreated) {
                onNotificationCreated(data);
            }
        }
    );

    eventSource.onerror = error => {
        if (onError) {
            onError(error);
        }
    };

    return () => {
        eventSource.close();
    };
}
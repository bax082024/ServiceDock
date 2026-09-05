const API_URL = 'http://localhost:3000';

export async function getServices() {
    const response = await fetch(`${API_URL}/services`);

    if (!response.ok) {
        throw new Error('Failed to load services');
    }

    return response.json();
}

export async function getServiceStats(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/stats`
    );

    if (!response.ok) {
        throw new Error('Failed to load service stats');
    }

    return response.json();
}

export async function getServiceIncidents(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/incidents`
    );

    if (!response.ok) {
        throw new Error('Failed to load service incidents');
    }

    return response.json();
}

export async function getService(id) {
    const response = await fetch(
        `${API_URL}/services/${id}`
    );

    if (!response.ok) {
        throw new Error('Failed to load service');
    }

    return response.json();
}

export async function getServiceChecks(id) {
    const response = await fetch(
        `${API_URL}/services/${id}/checks`
    );

    if (!response.ok) {
        throw new Error('Failed to load service checks');
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
            error.message || 'Failed to create service'
        );
    }

    return response.json();
}
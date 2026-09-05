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
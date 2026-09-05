const db = require('./db');

async function checkService(service) {
    let newStatus;

    try {
        const response = await fetch(service.url, {
            signal: AbortSignal.timeout(5000)
        });

        newStatus = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
        newStatus = 'unreachable';
    }

    await db.query(
        `UPDATE services
         SET status = ?
         WHERE id = ?`,
        [newStatus, service.id]
    );

    await db.query(
        `INSERT INTO service_checks (service_id, status)
         VALUES (?, ?)`,
        [service.id, newStatus]
    );

    console.log(
        `[Monitor] ${service.name}: ${newStatus}`
    );
}

async function checkAllServices() {
    try {
        const [services] = await db.query(
            `SELECT id, name, url
             FROM services`
        );

        await Promise.all(
            services.map(service => checkService(service))
        );
    } catch (error) {
        console.error(
            '[Monitor] Failed to check services:',
            error.message
        );
    }
}

function startMonitor() {
    console.log('[Monitor] Started');

    checkAllServices();

    setInterval(() => {
        checkAllServices();
    }, 30000);
}

module.exports = startMonitor;
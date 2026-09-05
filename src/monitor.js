const db = require('./db');
const checkService = require('./checkService');

async function checkAllServices() {
    try {
        const [services] = await db.query(
            `SELECT id, name, url, status
             FROM services`
        );

        const results = await Promise.all(
            services.map(service =>
                checkService(service)
            )
        );

        for (const result of results) {
            console.log(
                `[Monitor] ${result.name}: ${result.status} (${result.responseTimeMs} ms)`
            );
        }

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
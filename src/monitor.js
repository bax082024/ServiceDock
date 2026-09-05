const db = require('./db');
const checkService = require('./checkService');

const CHECK_SCHEDULER_INTERVAL_MS = 1000;

const servicesBeingChecked = new Set();

async function runServiceCheck(service) {
    if (servicesBeingChecked.has(service.id)) {
        return null;
    }

    servicesBeingChecked.add(service.id);

    try {
        return await checkService(service);

    } finally {
        servicesBeingChecked.delete(service.id);
    }
}

async function checkDueServices() {
    try {
        const [services] = await db.query(
            `SELECT
                s.id,
                s.name,
                s.url,
                s.status,
                s.monitoring_enabled,
                s.check_interval_seconds,
                s.timeout_ms,
                s.slow_threshold_ms,
                MAX(sc.checked_at) AS last_checked_at
             FROM services s
             LEFT JOIN service_checks sc
                ON sc.service_id = s.id
             WHERE s.monitoring_enabled = TRUE
             GROUP BY
                s.id,
                s.name,
                s.url,
                s.status,
                s.monitoring_enabled,
                s.check_interval_seconds,
                s.timeout_ms,
                s.slow_threshold_ms
             HAVING
                last_checked_at IS NULL
                OR TIMESTAMPDIFF(
                    SECOND,
                    last_checked_at,
                    CURRENT_TIMESTAMP
                ) >= s.check_interval_seconds`
        );

        const servicesToCheck = services.filter(
            service =>
                !servicesBeingChecked.has(service.id)
        );

        const results = await Promise.all(
            servicesToCheck.map(service =>
                runServiceCheck(service)
            )
        );

        for (const result of results) {
            if (!result) {
                continue;
            }

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

    checkDueServices();

    setInterval(() => {
        checkDueServices();
    }, CHECK_SCHEDULER_INTERVAL_MS);
}

module.exports = startMonitor;
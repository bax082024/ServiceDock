const db = require('./db');

async function checkService(service) {
    let newStatus;
    let responseTimeMs = null;

    const startTime = Date.now();

    try {
        const response = await fetch(service.url, {
            signal: AbortSignal.timeout(5000)
        });

        responseTimeMs = Date.now() - startTime;

        newStatus = response.ok
            ? 'healthy'
            : 'unhealthy';

    } catch (error) {
        responseTimeMs = Date.now() - startTime;
        newStatus = 'unreachable';
    }

    const wasFailing =
        service.status === 'unhealthy' ||
        service.status === 'unreachable';

    const isFailing =
        newStatus === 'unhealthy' ||
        newStatus === 'unreachable';

    if (!wasFailing && isFailing) {
        await db.query(
            `INSERT INTO incidents (service_id)
             VALUES (?)`,
            [service.id]
        );

        console.log(
            `[Incident] Started for ${service.name}`
        );
    }

    if (wasFailing && !isFailing) {
        await db.query(
            `UPDATE incidents
             SET resolved_at = CURRENT_TIMESTAMP
             WHERE service_id = ?
               AND resolved_at IS NULL`,
            [service.id]
        );

        console.log(
            `[Incident] Resolved for ${service.name}`
        );
    }

    await db.query(
        `UPDATE services
         SET status = ?
         WHERE id = ?`,
        [newStatus, service.id]
    );

    await db.query(
        `INSERT INTO service_checks
            (service_id, status, response_time_ms)
         VALUES (?, ?, ?)`,
        [
            service.id,
            newStatus,
            responseTimeMs
        ]
    );

    return {
        id: service.id,
        name: service.name,
        url: service.url,
        status: newStatus,
        responseTimeMs
    };
}

module.exports = checkService;
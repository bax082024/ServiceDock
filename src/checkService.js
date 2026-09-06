const db = require('./db');

const {
    publishEvent
} = require('./realtime');

async function checkService(service) {
    let newStatus;
    let responseTimeMs = null;

    const timeoutMs =
        Number(service.timeout_ms) || 5000;

    const startTime = Date.now();

    try {
        const response = await fetch(service.url, {
            signal: AbortSignal.timeout(timeoutMs)
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
        const [incidentResult] = await db.query(
            `INSERT INTO incidents (service_id)
             VALUES (?)`,
            [service.id]
        );

        const incidentId =
            incidentResult.insertId;

        const notificationTitle =
            `${service.name} is down`;

        const notificationMessage =
            newStatus === 'unreachable'
                ? 'Service is unreachable.'
                : 'Service returned an unhealthy response.';

        const [notificationResult] = await db.query(
            `INSERT INTO notifications
                (
                    service_id,
                    incident_id,
                    type,
                    title,
                    message
                )
             VALUES (?, ?, ?, ?, ?)`,
            [
                service.id,
                incidentId,
                'error',
                notificationTitle,
                notificationMessage
            ]
        );

        const notification = {
            id: notificationResult.insertId,
            serviceId: service.id,
            incidentId,
            serviceName: service.name,
            type: 'error',
            title: notificationTitle,
            message: notificationMessage,
            read: false,
            createdAt: new Date().toISOString()
        };

        publishEvent(
            'notification-created',
            notification
        );

        publishEvent(
            'incident-started',
            {
                incident_id: incidentId,
                service_id: service.id,
                service_name: service.name,
                type: 'incident_started',
                event_at: new Date().toISOString()
            }
        );

        console.log(
            `[Incident] Started for ${service.name}`
        );
    }

    if (wasFailing && !isFailing) {
        const [activeIncidents] = await db.query(
            `SELECT id
             FROM incidents
             WHERE service_id = ?
               AND resolved_at IS NULL
             ORDER BY started_at DESC
             LIMIT 1`,
            [service.id]
        );

        await db.query(
            `UPDATE incidents
             SET resolved_at = CURRENT_TIMESTAMP
             WHERE service_id = ?
               AND resolved_at IS NULL`,
            [service.id]
        );

        if (activeIncidents.length > 0) {
            const incidentId =
                activeIncidents[0].id;

            const notificationTitle =
                `${service.name} recovered`;

            const notificationMessage =
                `Response time: ${responseTimeMs} ms`;

            const [notificationResult] = await db.query(
                `INSERT INTO notifications
                    (
                        service_id,
                        incident_id,
                        type,
                        title,
                        message
                    )
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    service.id,
                    incidentId,
                    'success',
                    notificationTitle,
                    notificationMessage
                ]
            );

            const notification = {
                id: notificationResult.insertId,
                serviceId: service.id,
                incidentId,
                serviceName: service.name,
                type: 'success',
                title: notificationTitle,
                message: notificationMessage,
                read: false,
                createdAt: new Date().toISOString()
            };

            publishEvent(
                'notification-created',
                notification
            );

            publishEvent(
                'incident-resolved',
                {
                    incident_id: incidentId,
                    service_id: service.id,
                    service_name: service.name,
                    type: 'incident_resolved',
                    event_at: new Date().toISOString()
                }
            );
        }

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
            (
                service_id,
                status,
                response_time_ms
            )
         VALUES (?, ?, ?)`,
        [
            service.id,
            newStatus,
            responseTimeMs
        ]
    );

    publishEvent(
        'service-check',
        {
            serviceId: service.id,
            name: service.name,
            url: service.url,
            previousStatus: service.status,
            status: newStatus,
            responseTimeMs,
            checkedAt: new Date().toISOString()
        }
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
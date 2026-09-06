const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/summary', async (req, res) => {
    try {
        const [serviceOverviewRows] = await db.query(`
            SELECT
                COUNT(*) AS totalServices,
                SUM(status = 'healthy') AS healthyServices,
                SUM(status != 'healthy') AS failingServices,
                SUM(monitoring_enabled = FALSE) AS pausedServices
            FROM services
        `);

        const [incidentOverviewRows] = await db.query(`
            SELECT
                COUNT(*) AS totalIncidents,
                SUM(resolved_at IS NULL) AS activeIncidents
            FROM incidents
        `);

        const [uptimeRows] = await db.query(`
            SELECT
                AVG(service_uptime) AS averageUptime
            FROM (
                SELECT
                    s.id,
                    CASE
                        WHEN COUNT(sc.id) = 0 THEN 0
                        ELSE
                            (
                                SUM(sc.status = 'healthy')
                                / COUNT(sc.id)
                            ) * 100
                    END AS service_uptime
                FROM services s
                LEFT JOIN service_checks sc
                    ON sc.service_id = s.id
                GROUP BY s.id
            ) AS service_uptimes
        `);

        const [services] = await db.query(`
            SELECT
                s.id,
                s.name,
                s.url,
                s.status,
                s.monitoring_enabled,
                s.check_interval_seconds,
                s.timeout_ms,
                s.slow_threshold_ms,

                (
                    SELECT sc.response_time_ms
                    FROM service_checks sc
                    WHERE sc.service_id = s.id
                    ORDER BY
                        sc.checked_at DESC,
                        sc.id DESC
                    LIMIT 1
                ) AS last_response_time_ms

            FROM services s
            ORDER BY s.id ASC
        `);

        const [recentActivity] = await db.query(`
            SELECT *
            FROM (
                SELECT
                    i.id AS incident_id,
                    i.service_id,
                    s.name AS service_name,
                    'incident_started' AS type,
                    i.started_at AS event_at
                FROM incidents i
                JOIN services s
                    ON s.id = i.service_id

                UNION ALL

                SELECT
                    i.id AS incident_id,
                    i.service_id,
                    s.name AS service_name,
                    'incident_resolved' AS type,
                    i.resolved_at AS event_at
                FROM incidents i
                JOIN services s
                    ON s.id = i.service_id
                WHERE i.resolved_at IS NOT NULL
            ) AS activity
            ORDER BY event_at DESC
            LIMIT 8
        `);

        const serviceOverview = serviceOverviewRows[0];
        const incidentOverview = incidentOverviewRows[0];

        res.status(200).json({
            overview: {
                totalServices:
                    Number(serviceOverview.totalServices || 0),

                healthyServices:
                    Number(serviceOverview.healthyServices || 0),

                failingServices:
                    Number(serviceOverview.failingServices || 0),

                pausedServices:
                    Number(serviceOverview.pausedServices || 0),

                totalIncidents:
                    Number(incidentOverview.totalIncidents || 0),

                activeIncidents:
                    Number(incidentOverview.activeIncidents || 0),

                averageUptime:
                    uptimeRows[0].averageUptime === null
                        ? 0
                        : Number(
                            Number(
                                uptimeRows[0].averageUptime
                            ).toFixed(2)
                        )
            },

            services: services.map(service => ({
                ...service,
                last_response_time_ms:
                    service.last_response_time_ms === null
                        ? null
                        : Number(service.last_response_time_ms)
            })),

            recentActivity
        });

    } catch (error) {
        console.error(
            '[Dashboard] Failed to load summary:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to load dashboard summary'
        });
    }
});

module.exports = router;
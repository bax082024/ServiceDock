const express = require('express');
const db = require('../db');
const checkService = require('../checkService');

const router = express.Router();

function formatStats(row) {
    const totalChecks = Number(row.totalChecks);
    const healthyChecks = Number(row.healthyChecks || 0);
    const failedChecks = Number(row.failedChecks || 0);

    const uptimePercentage =
        totalChecks === 0
            ? 0
            : Number(
                ((healthyChecks / totalChecks) * 100).toFixed(2)
            );

    return {
        totalChecks,
        healthyChecks,
        failedChecks,
        uptimePercentage,

        responseTime: {
            averageMs:
                row.averageResponseTimeMs === null
                    ? null
                    : Number(Number(row.averageResponseTimeMs).toFixed(2)),

            fastestMs:
                row.fastestResponseTimeMs === null
                    ? null
                    : Number(row.fastestResponseTimeMs),

            slowestMs:
                row.slowestResponseTimeMs === null
                    ? null
                    : Number(row.slowestResponseTimeMs)
        }
    };
}

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                id,
                name,
                url,
                status,
                monitoring_enabled,
                check_interval_seconds,
                timeout_ms,
                slow_threshold_ms,
                created_at
             FROM services
             ORDER BY id ASC`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error(
            'Failed to fetch services:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch services'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `SELECT
                id,
                name,
                url,
                status,
                monitoring_enabled,
                check_interval_seconds,
                timeout_ms,
                slow_threshold_ms,
                created_at
             FROM services
             WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error(
            'Failed to fetch service:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch service'
        });
    }
});

router.get('/:id/checks', async (req, res) => {
    try {
        const { id } = req.params;

        const [services] = await db.query(
            `SELECT id, name
             FROM services
             WHERE id = ?`,
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        const [checks] = await db.query(
            `SELECT id, status, response_time_ms, checked_at
             FROM service_checks
             WHERE service_id = ?
             ORDER BY checked_at DESC`,
            [id]
        );

        res.status(200).json({
            service: {
                id: services[0].id,
                name: services[0].name
            },
            checks
        });
    } catch (error) {
        console.error(
            'Failed to fetch service checks:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch service checks'
        });
    }
});

router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;

        const [services] = await db.query(
            `SELECT id, name, status
             FROM services
             WHERE id = ?`,
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        const [allTimeRows] = await db.query(
            `SELECT
                COUNT(*) AS totalChecks,
                SUM(status = 'healthy') AS healthyChecks,
                SUM(status != 'healthy') AS failedChecks,

                AVG(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS averageResponseTimeMs,

                MIN(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS fastestResponseTimeMs,

                MAX(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS slowestResponseTimeMs
             FROM service_checks
             WHERE service_id = ?`,
            [id]
        );

        const [last24HoursRows] = await db.query(
            `SELECT
                COUNT(*) AS totalChecks,
                SUM(status = 'healthy') AS healthyChecks,
                SUM(status != 'healthy') AS failedChecks,

                AVG(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS averageResponseTimeMs,

                MIN(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS fastestResponseTimeMs,

                MAX(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS slowestResponseTimeMs
             FROM service_checks
             WHERE service_id = ?
               AND checked_at >= NOW() - INTERVAL 24 HOUR`,
            [id]
        );

        const [last7DaysRows] = await db.query(
            `SELECT
                COUNT(*) AS totalChecks,
                SUM(status = 'healthy') AS healthyChecks,
                SUM(status != 'healthy') AS failedChecks,

                AVG(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS averageResponseTimeMs,

                MIN(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS fastestResponseTimeMs,

                MAX(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS slowestResponseTimeMs
             FROM service_checks
             WHERE service_id = ?
               AND checked_at >= NOW() - INTERVAL 7 DAY`,
            [id]
        );

        const [last30DaysRows] = await db.query(
            `SELECT
                COUNT(*) AS totalChecks,
                SUM(status = 'healthy') AS healthyChecks,
                SUM(status != 'healthy') AS failedChecks,

                AVG(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS averageResponseTimeMs,

                MIN(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS fastestResponseTimeMs,

                MAX(
                    CASE
                        WHEN status = 'healthy'
                        THEN response_time_ms
                    END
                ) AS slowestResponseTimeMs
             FROM service_checks
             WHERE service_id = ?
               AND checked_at >= NOW() - INTERVAL 30 DAY`,
            [id]
        );

        const [incidentStatsRows] = await db.query(
            `SELECT
                COUNT(*) AS totalIncidents,
                SUM(resolved_at IS NULL) AS activeIncidents,
                AVG(
                    CASE
                        WHEN resolved_at IS NOT NULL
                        THEN TIMESTAMPDIFF(
                            SECOND,
                            started_at,
                            resolved_at
                        )
                    END
                ) AS averageIncidentDurationSeconds,
                MAX(
                    CASE
                        WHEN resolved_at IS NOT NULL
                        THEN TIMESTAMPDIFF(
                            SECOND,
                            started_at,
                            resolved_at
                        )
                    END
                ) AS longestIncidentDurationSeconds,
                MAX(started_at) AS lastIncidentStartedAt
            FROM incidents
            WHERE service_id = ?`,
            [id]
        );

        const incidentStats = incidentStatsRows[0];

        res.status(200).json({
            service: {
                id: services[0].id,
                name: services[0].name,
                status: services[0].status
            },
            stats: {
                allTime: formatStats(allTimeRows[0]),
                last24Hours: formatStats(last24HoursRows[0]),
                last7Days: formatStats(last7DaysRows[0]),
                last30Days: formatStats(last30DaysRows[0]),

                incidents: {
                    totalIncidents:
                        Number(incidentStats.totalIncidents),

                    activeIncidents:
                        Number(incidentStats.activeIncidents || 0),

                    averageDurationSeconds:
                        incidentStats.averageIncidentDurationSeconds === null
                            ? null
                            : Number(
                                Number(
                                    incidentStats.averageIncidentDurationSeconds
                                ).toFixed(2)
                            ),

                    longestDurationSeconds:
                        incidentStats.longestIncidentDurationSeconds === null
                            ? null
                            : Number(
                                incidentStats.longestIncidentDurationSeconds
                            ),

                    lastIncidentStartedAt:
                        incidentStats.lastIncidentStartedAt
                }
            }
        });
    } catch (error) {
        console.error(
            'Failed to fetch service stats:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch service stats'
        });
    }
});

router.get('/:id/incidents', async (req, res) => {
    try {
        const { id } = req.params;

        // Make sure the service exists
        const [services] = await db.query(
            `SELECT id, name
             FROM services
             WHERE id = ?`,
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        // Get all incidents for this service
        const [incidents] = await db.query(
            `SELECT
                id,
                started_at,
                resolved_at,
                TIMESTAMPDIFF(
                    SECOND,
                    started_at,
                    COALESCE(resolved_at, CURRENT_TIMESTAMP)
                ) AS duration_seconds
             FROM incidents
             WHERE service_id = ?
             ORDER BY started_at DESC`,
            [id]
        );

        const formattedIncidents = incidents.map(incident => ({
            id: incident.id,
            startedAt: incident.started_at,
            resolvedAt: incident.resolved_at,
            durationSeconds: Number(incident.duration_seconds),
            status:
                incident.resolved_at === null
                    ? 'active'
                    : 'resolved'
        }));

        res.status(200).json({
            service: {
                id: services[0].id,
                name: services[0].name
            },
            incidents: formattedIncidents
        });

    } catch (error) {
        console.error(
            'Failed to fetch incidents:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch incidents'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, url } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Name is required'
            });
        }

        if (!url || !url.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'URL is required'
            });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                status: 'error',
                message: 'URL must be valid'
            });
        }

        const [result] = await db.query(
            `INSERT INTO services (name, url)
             VALUES (?, ?)`,
            [name.trim(), url.trim()]
        );

        res.status(201).json({
            id: result.insertId,
            name: name.trim(),
            url: url.trim(),
            status: 'unknown'
        });
    } catch (error) {
        console.error('Failed to create service:', error.message);

        res.status(500).json({
            status: 'error',
            message: 'Failed to create service'
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            url,
            monitoring_enabled,
            check_interval_seconds,
            timeout_ms,
            slow_threshold_ms
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Name is required'
            });
        }

        if (!url || !url.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'URL is required'
            });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                status: 'error',
                message: 'URL must be valid'
            });
        }

        if (typeof monitoring_enabled !== 'boolean') {
            return res.status(400).json({
                status: 'error',
                message: 'Monitoring enabled must be true or false'
            });
        }

        const checkIntervalSeconds =
            Number(check_interval_seconds);

        const timeoutMs =
            Number(timeout_ms);

        const slowThresholdMs =
            Number(slow_threshold_ms);

        if (
            !Number.isInteger(checkIntervalSeconds) ||
            checkIntervalSeconds < 1
        ) {
            return res.status(400).json({
                status: 'error',
                message:
                    'Check interval must be a whole number greater than 0'
            });
        }

        if (
            !Number.isInteger(timeoutMs) ||
            timeoutMs < 100
        ) {
            return res.status(400).json({
                status: 'error',
                message:
                    'Timeout must be a whole number of at least 100 ms'
            });
        }

        if (
            !Number.isInteger(slowThresholdMs) ||
            slowThresholdMs < 1
        ) {
            return res.status(400).json({
                status: 'error',
                message:
                    'Slow threshold must be a whole number greater than 0'
            });
        }

        const [result] = await db.query(
            `UPDATE services
             SET
                name = ?,
                url = ?,
                monitoring_enabled = ?,
                check_interval_seconds = ?,
                timeout_ms = ?,
                slow_threshold_ms = ?
             WHERE id = ?`,
            [
                name.trim(),
                url.trim(),
                monitoring_enabled,
                checkIntervalSeconds,
                timeoutMs,
                slowThresholdMs,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        res.status(200).json({
            id: Number(id),
            name: name.trim(),
            url: url.trim(),
            monitoring_enabled,
            check_interval_seconds:
                checkIntervalSeconds,
            timeout_ms: timeoutMs,
            slow_threshold_ms:
                slowThresholdMs
        });

    } catch (error) {
        console.error(
            'Failed to update service:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to update service'
        });
    }
});

router.post('/:id/check', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `SELECT
                id,
                name,
                url,
                status,
                monitoring_enabled,
                check_interval_seconds,
                timeout_ms,
                slow_threshold_ms
            FROM services
            WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        const result = await checkService(rows[0]);

        res.status(200).json(result);

    } catch (error) {
        console.error(
            'Failed to check service:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to check service'
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM services WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }

        res.status(200).json({
            status: 'ok',
            message: 'Service deleted'
        });
    } catch (error) {
        console.error('Failed to delete service:', error.message);

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete service'
        });
    }
});

module.exports = router;
const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                incidents.id,
                incidents.service_id,
                services.name AS service_name,
                services.url AS service_url,
                incidents.started_at,
                incidents.resolved_at,
                TIMESTAMPDIFF(
                    SECOND,
                    incidents.started_at,
                    COALESCE(
                        incidents.resolved_at,
                        CURRENT_TIMESTAMP
                    )
                ) AS duration_seconds
             FROM incidents
             INNER JOIN services
                 ON incidents.service_id = services.id
             ORDER BY incidents.started_at DESC`
        );

        const incidents = rows.map(incident => ({
            id: incident.id,
            serviceId: incident.service_id,
            serviceName: incident.service_name,
            serviceUrl: incident.service_url,
            startedAt: incident.started_at,
            resolvedAt: incident.resolved_at,
            durationSeconds: Number(
                incident.duration_seconds
            ),
            status:
                incident.resolved_at === null
                    ? 'active'
                    : 'resolved'
        }));

        res.status(200).json({
            incidents
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

module.exports = router;
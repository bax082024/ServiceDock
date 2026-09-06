const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                n.id,
                n.service_id,
                n.incident_id,
                n.type,
                n.title,
                n.message,
                n.is_read,
                n.created_at,
                s.name AS service_name
            FROM notifications n
            LEFT JOIN services s
                ON s.id = n.service_id
            ORDER BY
                n.created_at DESC,
                n.id DESC
            LIMIT 100
        `);

        const notifications =
            rows.map(notification => ({
                id: notification.id,

                serviceId:
                    notification.service_id,

                incidentId:
                    notification.incident_id,

                serviceName:
                    notification.service_name,

                type:
                    notification.type,

                title:
                    notification.title,

                message:
                    notification.message,

                read:
                    Boolean(notification.is_read),

                createdAt:
                    notification.created_at
            }));

        res.status(200).json({
            notifications
        });

    } catch (error) {
        console.error(
            'Failed to fetch notifications:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications'
        });
    }
});

router.put('/read-all', async (req, res) => {
    try {
        const [result] = await db.query(`
            UPDATE notifications
            SET is_read = TRUE
            WHERE is_read = FALSE
        `);

        res.status(200).json({
            status: 'ok',
            updatedNotifications:
                result.affectedRows
        });

    } catch (error) {
        console.error(
            'Failed to mark notifications as read:',
            error.message
        );

        res.status(500).json({
            status: 'error',
            message:
                'Failed to mark notifications as read'
        });
    }
});

module.exports = router;
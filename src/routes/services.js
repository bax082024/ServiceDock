const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, name, url, status, created_at
             FROM services
             ORDER BY id ASC`
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Failed to fetch services:', error.message);

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
            `SELECT id, name, url, status, created_at
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
        console.error('Failed to fetch service:', error.message);

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch service'
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
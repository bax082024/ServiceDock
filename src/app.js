const express = require('express');
const db = require('./db');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'ServiceDock API'
    });
});

app.get('/db-check', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS connected');

        res.status(200).json({
            status: 'ok',
            database: 'connected',
            result: rows[0]
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);

        res.status(500).json({
            status: 'error',
            database: 'disconnected'
        });
    }
});

app.listen(PORT, () => {
    console.log(`ServiceDock API running on port ${PORT}`);
});
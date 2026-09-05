const express = require('express');
const db = require('./db');
const initDb = require('./initDb');
const servicesRouter = require('./routes/services');
const startMonitor = require('./monitor');
const cors = require('cors');
const incidentsRouter = require('./routes/incidents');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());


app.use('/services', servicesRouter);
app.use('/incidents', incidentsRouter);

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

async function startServer() {
    try {
        await initDb();
        startMonitor();

        app.listen(PORT, () => {
            console.log(`ServiceDock API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize database:', error.message);
        process.exit(1);
    }
}

startServer();
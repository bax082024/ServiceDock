const express = require('express');

const {
    addClient
} = require('../realtime');

const router = express.Router();

router.get('/', (req, res) => {
    res.setHeader(
        'Content-Type',
        'text/event-stream'
    );

    res.setHeader(
        'Cache-Control',
        'no-cache'
    );

    res.setHeader(
        'Connection',
        'keep-alive'
    );

    res.flushHeaders();

    res.write(
        `event: connected\n` +
        `data: ${JSON.stringify({
            status: 'connected'
        })}\n\n`
    );

    const removeClient = addClient(res);

    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 25000);

    req.on('close', () => {
        clearInterval(heartbeat);

        removeClient();

        res.end();
    });
});

module.exports = router;
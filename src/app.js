const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'ServiceDock API'
    });
});

app.listen(PORT, () => {
    console.log(`ServiceDock API running on port ${PORT}`);
});
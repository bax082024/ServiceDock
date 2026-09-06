const clients = new Set();

function addClient(response) {
    clients.add(response);

    console.log(
        `[SSE] Client connected (${clients.size} total)`
    );

    return function removeClient() {
        clients.delete(response);

        console.log(
            `[SSE] Client disconnected (${clients.size} total)`
        );
    };
}

function publishEvent(type, data) {
    const message =
        `event: ${type}\n` +
        `data: ${JSON.stringify(data)}\n\n`;

    for (const client of clients) {
        client.write(message);
    }
}

module.exports = {
    addClient,
    publishEvent
};
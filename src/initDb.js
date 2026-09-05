const db = require('./db');

async function initDb() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS services (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'unknown',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS service_checks (
            id INT PRIMARY KEY AUTO_INCREMENT,
            service_id INT NOT NULL,
            status VARCHAR(20) NOT NULL,
            checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id)
                ON DELETE CASCADE
        )
    `);

    console.log('Database initialized');
}

module.exports = initDb;
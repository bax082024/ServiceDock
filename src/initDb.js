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

    await db.query(`
        CREATE TABLE IF NOT EXISTS incidents (
            id INT PRIMARY KEY AUTO_INCREMENT,
            service_id INT NOT NULL,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP NULL,
            FOREIGN KEY (service_id) REFERENCES services(id)
                ON DELETE CASCADE
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            service_id INT NULL,
            incident_id INT NULL,
            type VARCHAR(20) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message VARCHAR(500) NOT NULL,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (service_id)
                REFERENCES services(id)
                ON DELETE CASCADE,

            FOREIGN KEY (incident_id)
                REFERENCES incidents(id)
                ON DELETE SET NULL
        )
    `);

    const [columns] = await db.query(`
        SHOW COLUMNS FROM service_checks LIKE 'response_time_ms'
    `);

    if (columns.length === 0) {
        await db.query(`
            ALTER TABLE service_checks
            ADD COLUMN response_time_ms INT NULL
            AFTER status
        `);

        console.log('Added response_time_ms column');
    }

    const [monitoringEnabledColumn] = await db.query(`
        SHOW COLUMNS FROM services LIKE 'monitoring_enabled'
    `);

    if (monitoringEnabledColumn.length === 0) {
        await db.query(`
            ALTER TABLE services
            ADD COLUMN monitoring_enabled BOOLEAN NOT NULL DEFAULT TRUE
            AFTER status
        `);

        console.log('Added monitoring_enabled column');
    }

    const [checkIntervalColumn] = await db.query(`
        SHOW COLUMNS FROM services LIKE 'check_interval_seconds'
    `);

    if (checkIntervalColumn.length === 0) {
        await db.query(`
            ALTER TABLE services
            ADD COLUMN check_interval_seconds INT NOT NULL DEFAULT 30
            AFTER monitoring_enabled
        `);

        console.log('Added check_interval_seconds column');
    }

    const [timeoutColumn] = await db.query(`
        SHOW COLUMNS FROM services LIKE 'timeout_ms'
    `);

    if (timeoutColumn.length === 0) {
        await db.query(`
            ALTER TABLE services
            ADD COLUMN timeout_ms INT NOT NULL DEFAULT 5000
            AFTER check_interval_seconds
        `);

        console.log('Added timeout_ms column');
    }

    const [slowThresholdColumn] = await db.query(`
        SHOW COLUMNS FROM services LIKE 'slow_threshold_ms'
    `);

    if (slowThresholdColumn.length === 0) {
        await db.query(`
            ALTER TABLE services
            ADD COLUMN slow_threshold_ms INT NOT NULL DEFAULT 500
            AFTER timeout_ms
        `);

        console.log('Added slow_threshold_ms column');
    }

    console.log('Database initialized');
}

module.exports = initDb;
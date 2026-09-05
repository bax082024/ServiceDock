function ServiceCard({ service }) {
    const stats = service.stats?.allTime;
    const incidentStats = service.stats?.incidents;

    const averageResponse =
        stats?.responseTime?.averageMs;

    return (
        <article className="service-card">
            <div className="service-card-header">
                <div>
                    <div className="service-title">
                        <span
                            className={`status-dot ${service.status}`}
                        ></span>

                        <h3>{service.name}</h3>
                    </div>

                    <p className="service-url">
                        {service.url}
                    </p>
                </div>

                <span
                    className={`status-badge ${service.status}`}
                >
                    {service.status}
                </span>
            </div>

            <div className="service-metrics">
                <div className="metric">
                    <span>Uptime</span>
                    <strong>
                        {stats?.uptimePercentage ?? 0}%
                    </strong>
                </div>

                <div className="metric">
                    <span>Avg response</span>
                    <strong>
                        {averageResponse ?? 'N/A'}
                        {averageResponse !== null &&
                         averageResponse !== undefined
                            ? ' ms'
                            : ''}
                    </strong>
                </div>

                <div className="metric">
                    <span>Incidents</span>
                    <strong>
                        {incidentStats?.totalIncidents ?? 0}
                    </strong>
                </div>

                <div className="metric">
                    <span>Active</span>
                    <strong>
                        {incidentStats?.activeIncidents ?? 0}
                    </strong>
                </div>
            </div>
        </article>
    );
}

export default ServiceCard;
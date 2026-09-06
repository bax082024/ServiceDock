import { useNavigate } from 'react-router-dom';

function ServiceCard({ service }) {
    const navigate = useNavigate();

    const responseTime =
        service.last_response_time_ms;

    const isPaused =
        !service.monitoring_enabled;

    const isSlow =
        responseTime != null &&
        responseTime > service.slow_threshold_ms;

    return (
        <article
            className="service-card clickable"
            onClick={() =>
                navigate(`/services/${service.id}`)
            }
        >
            <div className="service-card-header">
                <div>
                    <div className="service-title">
                        <span
                            className={
                                `status-dot ${service.status}`
                            }
                        ></span>

                        <h3>{service.name}</h3>
                    </div>

                    <p className="service-url">
                        {service.url}
                    </p>
                </div>

                <div className="service-card-badges">
                    <span
                        className={
                            `status-badge ${service.status}`
                        }
                    >
                        {service.status}
                    </span>

                    {isPaused && (
                        <span className="monitoring-badge paused">
                            PAUSED
                        </span>
                    )}
                </div>
            </div>

            <div className="service-metrics">
                <div className="metric">
                    <span>Last response</span>

                    <strong
                        className={
                            isSlow
                                ? 'metric-warning'
                                : ''
                        }
                    >
                        {responseTime != null
                            ? `${responseTime} ms`
                            : 'N/A'}
                    </strong>
                </div>

                <div className="metric">
                    <span>Check interval</span>

                    <strong>
                        {service.check_interval_seconds}s
                    </strong>
                </div>

                <div className="metric">
                    <span>Timeout</span>

                    <strong>
                        {service.timeout_ms} ms
                    </strong>
                </div>

                <div className="metric">
                    <span>Monitoring</span>

                    <strong
                        className={
                            isPaused
                                ? 'monitoring-text paused'
                                : 'monitoring-text active'
                        }
                    >
                        {isPaused
                            ? 'Paused'
                            : 'Active'}
                    </strong>
                </div>
            </div>
        </article>
    );
}

export default ServiceCard;
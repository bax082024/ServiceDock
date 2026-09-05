import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const SLOW_THRESHOLD_MS = 500;

function ResponseTimeChart({ checks }) {
    const chartData = checks
        .slice(0, 30)
        .reverse()
        .map(check => {
            const responseTime = check.response_time_ms;

            const isUnreachable =
                check.status === 'unreachable';

            const isSlow =
                !isUnreachable &&
                responseTime != null &&
                responseTime > SLOW_THRESHOLD_MS;

            return {
                id: check.id,

                time: new Date(
                    check.checked_at
                ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }),

                responseTime:
                    !isUnreachable && !isSlow
                        ? responseTime
                        : null,

                slowMarker:
                    isSlow
                        ? 0
                        : null,

                outageMarker:
                    isUnreachable
                        ? 0
                        : null,

                actualResponseTime: responseTime,
                status: check.status
            };
        });

    const normalResponseTimes = chartData
        .map(check => check.responseTime)
        .filter(value => value != null);

    const maxResponseTime =
        normalResponseTimes.length === 0
            ? 10
            : Math.max(...normalResponseTimes);

    const yAxisMax = Math.max(
        Math.ceil(maxResponseTime * 1.25),
        10
    );

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                No response-time data available yet.
            </div>
        );
    }

    return (
        <div className="response-chart">
            <ResponsiveContainer
                width="100%"
                height={300}
            >
                <LineChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#202938"
                    />

                    <XAxis
                        dataKey="time"
                        stroke="#758198"
                        tick={{
                            fontSize: 11
                        }}
                        minTickGap={35}
                    />

                    <YAxis
                        stroke="#758198"
                        tick={{
                            fontSize: 11
                        }}
                        width={55}
                        unit=" ms"
                        domain={[0, yAxisMax]}
                    />

                    <Tooltip
                        contentStyle={{
                            background: '#111823',
                            border: '1px solid #29364a',
                            borderRadius: '8px'
                        }}
                        labelStyle={{
                            color: '#8fa0bb'
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="responseTime"
                        name="Response time"
                        stroke="#3978ff"
                        strokeWidth={2}
                        connectNulls={false}
                        dot={{
                            r: 3
                        }}
                        activeDot={{
                            r: 5
                        }}
                    />

                    <Line
                        type="linear"
                        dataKey="slowMarker"
                        name="Slow response"
                        stroke="transparent"
                        connectNulls={false}
                        dot={{
                            r: 6,
                            fill: '#f0a13e',
                            stroke: '#f0a13e'
                        }}
                        activeDot={{
                            r: 7,
                            fill: '#f0a13e',
                            stroke: '#f0a13e'
                        }}
                    />

                    <Line
                        type="linear"
                        dataKey="outageMarker"
                        name="Unreachable"
                        stroke="transparent"
                        connectNulls={false}
                        dot={{
                            r: 6,
                            fill: '#ff5c70',
                            stroke: '#ff5c70'
                        }}
                        activeDot={{
                            r: 7,
                            fill: '#ff5c70',
                            stroke: '#ff5c70'
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="chart-legend">
                <span>
                    <span className="chart-legend-dot response"></span>
                    Normal response
                </span>

                <span>
                    <span className="chart-legend-dot slow"></span>
                    Slow response
                </span>

                <span>
                    <span className="chart-legend-dot outage"></span>
                    Unreachable
                </span>
            </div>
        </div>
    );
}

export default ResponseTimeChart;
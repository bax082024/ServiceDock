import {
    useServiceDock
} from '../context/ServiceDockContext';

function NotificationDrawer() {
    const {
        notificationHistory,
        notificationDrawerOpen,
        closeNotificationDrawer
    } = useServiceDock();

    if (!notificationDrawerOpen) {
        return null;
    }

    return (
        <div
            className="notification-drawer-backdrop"
            onClick={closeNotificationDrawer}
        >
            <aside
                className="notification-drawer"
                onClick={event =>
                    event.stopPropagation()
                }
            >
                <div className="notification-drawer-header">
                    <div>
                        <p className="eyebrow">
                            LIVE ACTIVITY
                        </p>

                        <h3>Notifications</h3>
                    </div>

                    <button
                        type="button"
                        className="notification-drawer-close"
                        onClick={closeNotificationDrawer}
                    >
                        ×
                    </button>
                </div>

                <div className="notification-history-list">
                    {notificationHistory.length === 0 && (
                        <p className="empty-state">
                            No notifications yet.
                        </p>
                    )}

                    {notificationHistory.map(notification => (
                        <div
                            className={
                                `notification-history-item ${notification.type}`
                            }
                            key={notification.id}
                        >
                            <span className="notification-history-dot">
                            </span>

                            <div className="notification-history-content">
                                <strong>
                                    {notification.title}
                                </strong>

                                <span>
                                    {notification.message}
                                </span>

                                <time>
                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}
                                </time>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}

export default NotificationDrawer;
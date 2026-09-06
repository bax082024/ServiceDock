import {
    useServiceDock
} from '../context/ServiceDockContext';

function ToastContainer() {
    const {
        notifications,
        removeNotification
    } = useServiceDock();

    return (
        <div className="toast-container">
            {notifications.map(notification => (
                <div
                    className={
                        `toast ${notification.type}`
                    }
                    key={notification.id}
                >
                    <div className="toast-indicator"></div>

                    <div className="toast-content">
                        <strong>
                            {notification.title}
                        </strong>

                        <span>
                            {notification.message}
                        </span>
                    </div>

                    <button
                        className="toast-close"
                        type="button"
                        onClick={() =>
                            removeNotification(
                                notification.id
                            )
                        }
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;
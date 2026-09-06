import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

import {
    getNotifications,
    markAllNotificationsRead,
    subscribeToDashboardEvents
} from '../services/api';

const ServiceDockContext = createContext(null);

export function ServiceDockProvider({ children }) {
    const [connectionStatus, setConnectionStatus] =
        useState('connecting');

    const [latestServiceCheck, setLatestServiceCheck] =
        useState(null);

    const [latestActivityEvent, setLatestActivityEvent] =
        useState(null);

    const [notifications, setNotifications] =
        useState([]);

    const [notificationHistory, setNotificationHistory] =
        useState([]);

    const [notificationDrawerOpen, setNotificationDrawerOpen] =
        useState(false);

    function addNotification(notification) {
        const id = crypto.randomUUID();

        const item = {
            id,
            ...notification,
            createdAt: new Date().toISOString(),
            read: false
        };

        setNotifications(current => [
            ...current,
            item
        ]);

        setNotificationHistory(current => [
            item,
            ...current
        ]);

        setTimeout(() => {
            setNotifications(current =>
                current.filter(
                    item => item.id !== id
                )
            );
        }, 5000);
    }

    function removeNotification(id) {
        setNotifications(current =>
            current.filter(
                item => item.id !== id
            )
        );
    }

    async function openNotificationDrawer() {
        setNotificationDrawerOpen(true);

        setNotificationHistory(current =>
            current.map(item => ({
                ...item,
                read: true
            }))
        );

        try {
            await markAllNotificationsRead();
        } catch (error) {
            console.error(
                'Failed to persist notification read state:',
                error.message
            );
        }
    }

    function closeNotificationDrawer() {
        setNotificationDrawerOpen(false);
    }

    const unreadNotificationCount =
        notificationHistory.filter(
            item => !item.read
        ).length;

    useEffect(() => {
        let cancelled = false;

        async function loadNotifications() {
            try {
                const data =
                    await getNotifications();

                if (!cancelled) {
                    setNotificationHistory(
                        data.notifications
                    );
                }
            } catch (error) {
                console.error(
                    'Failed to load notification history:',
                    error.message
                );
            }
        }

        loadNotifications();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let disconnectTimer = null;
        let connectionIsDisconnected = false;

        const unsubscribe =
            subscribeToDashboardEvents({
                onServiceCheck: event => {
                    setLatestServiceCheck(event);

                    const wasFailing =
                        event.previousStatus === 'unhealthy' ||
                        event.previousStatus === 'unreachable';

                    const isFailing =
                        event.status === 'unhealthy' ||
                        event.status === 'unreachable';

                    if (!wasFailing && isFailing) {
                        addNotification({
                            type: 'error',
                            title: `${event.name} is down`,
                            message:
                                event.status === 'unreachable'
                                    ? 'Service is unreachable.'
                                    : 'Service returned an unhealthy response.'
                        });
                    }

                    if (wasFailing && !isFailing) {
                        addNotification({
                            type: 'success',
                            title: `${event.name} recovered`,
                            message:
                                `Response time: ${event.responseTimeMs} ms`
                        });
                    }
                },

                onIncidentStarted: event => {
                    setLatestActivityEvent(event);
                },

                onIncidentResolved: event => {
                    setLatestActivityEvent(event);
                },

                onOpen: () => {
                    connectionIsDisconnected = false;

                    if (disconnectTimer) {
                        clearTimeout(disconnectTimer);
                        disconnectTimer = null;
                    }

                    setConnectionStatus('connected');
                },

                onError: () => {
                    if (connectionIsDisconnected) {
                        return;
                    }

                    setConnectionStatus(
                        'reconnecting'
                    );

                    if (!disconnectTimer) {
                        disconnectTimer =
                            setTimeout(() => {
                                connectionIsDisconnected =
                                    true;

                                disconnectTimer =
                                    null;

                                setConnectionStatus(
                                    'disconnected'
                                );
                            }, 10000);
                    }
                }
            });

        return () => {
            unsubscribe();

            if (disconnectTimer) {
                clearTimeout(
                    disconnectTimer
                );
            }
        };
    }, []);

    return (
        <ServiceDockContext.Provider
            value={{
                connectionStatus,
                latestServiceCheck,
                latestActivityEvent,
                notifications,
                removeNotification,
                notificationHistory,
                unreadNotificationCount,
                notificationDrawerOpen,
                openNotificationDrawer,
                closeNotificationDrawer
            }}
        >
            {children}
        </ServiceDockContext.Provider>
    );
}

export function useServiceDock() {
    const context =
        useContext(ServiceDockContext);

    if (!context) {
        throw new Error(
            'useServiceDock must be used inside ServiceDockProvider'
        );
    }

    return context;
}
import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

import {
    subscribeToDashboardEvents
} from '../services/api';

const ServiceDockContext = createContext(null);


export function ServiceDockProvider({ children }) {
    const [connectionStatus, setConnectionStatus] =
        useState('connecting');

    const [latestServiceCheck, setLatestServiceCheck] =
        useState(null);

    const [notifications, setNotifications] =
    useState([]);

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

                    setConnectionStatus('reconnecting');

                    if (!disconnectTimer) {
                        disconnectTimer = setTimeout(() => {
                            connectionIsDisconnected = true;
                            disconnectTimer = null;

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
                clearTimeout(disconnectTimer);
            }
        };
    }, []);

    return (
        <ServiceDockContext.Provider
            value={{
                connectionStatus,
                latestServiceCheck,
                notifications,
                removeNotification
            }}
        >
            {children}
        </ServiceDockContext.Provider>
    );

  function addNotification(notification) {
      const id = crypto.randomUUID();

      setNotifications(current => [
          ...current,
          {
              id,
              ...notification
          }
      ]);

      setTimeout(() => {
          setNotifications(current =>
              current.filter(item => item.id !== id)
          );
      }, 5000);
  }

  function removeNotification(id) {
      setNotifications(current =>
          current.filter(item => item.id !== id)
      );
  }
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
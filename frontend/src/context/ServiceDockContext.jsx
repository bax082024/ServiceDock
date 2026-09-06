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

    useEffect(() => {
        let disconnectTimer = null;
        let connectionIsDisconnected = false;

        const unsubscribe =
            subscribeToDashboardEvents({
                onServiceCheck: event => {
                    setLatestServiceCheck(event);
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
                latestServiceCheck
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
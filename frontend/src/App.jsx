import { Route, Routes } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import IncidentsPage from './pages/IncidentsPage';
import ToastContainer from './components/ToastContainer';

import Sidebar from './components/Sidebar';

import './App.css';

function App() {
    return (
        <div className="app-layout">
            <Sidebar />

            <main className="dashboard">
                <Routes>
                    <Route
                        path="/"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/services"
                        element={<ServicesPage />}
                    />

                    <Route
                        path="/services/:id"
                        element={<ServiceDetailsPage />}
                    />

                    <Route
                        path="/incidents"
                        element={<IncidentsPage />}
                    />
                </Routes>
            </main>
            <ToastContainer />
        </div>
    );
}

export default App;
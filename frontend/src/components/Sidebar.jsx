import { NavLink } from 'react-router-dom';

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">S</div>

                <div>
                    <h1>ServiceDock</h1>
                    <span>Monitor</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/services"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    Services
                </NavLink>

                <NavLink
                    to="/incidents"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    Incidents
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <span className="system-dot"></span>
                Monitoring active
            </div>
        </aside>
    );
}

export default Sidebar;
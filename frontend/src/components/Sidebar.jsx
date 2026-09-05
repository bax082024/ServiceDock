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
                <button className="nav-item active">
                    Dashboard
                </button>

                <button className="nav-item">
                    Services
                </button>

                <button className="nav-item">
                    Incidents
                </button>
            </nav>

            <div className="sidebar-footer">
                <span className="system-dot"></span>
                Monitoring active
            </div>
        </aside>
    );
}

export default Sidebar;
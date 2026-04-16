import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FiHome, FiUsers, FiPieChart, FiSettings, FiZap, FiMenu, FiX
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const { groups } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/groups', icon: <FiUsers />, label: 'Groups' },
    { path: '/insights', icon: <FiZap />, label: 'AI Insights' },
    { path: '/analytics', icon: <FiPieChart />, label: 'Analytics' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <span className="logo-icon">💸</span>
          <span className="logo-text">SplitWise</span>
        </div>
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">💸</span>
            <div>
              <div className="logo-text">Split-O-Wise</div>
              <div className="logo-subtitle">Smart Expense Splitter</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {groups.length > 0 && (
          <div className="sidebar-groups">
            <div className="nav-section-label">Recent Groups</div>
            {groups.slice(0, 4).map(group => (
              <NavLink
                key={group.id}
                to={`/groups/${group.id}`}
                className={({ isActive }) =>
                  `nav-item nav-item--group ${isActive ? 'nav-item--active' : ''}`
                }
              >
                <span className="group-dot" />
                <span className="nav-label truncate">{group.name}</span>
                <span className="group-members-count">{group.members.length}</span>
              </NavLink>
            ))}
          </div>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-version">Copyright with Mousoom 2026</div>
        </div>
      </aside>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ListOrdered, 
  Bot, 
  BarChart3, 
  Settings, 
  Bell, 
  Menu, 
  X,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export default function Layout({ children, pageTitle = 'Dashboard' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Shortlists', path: '/shortlists', icon: ListOrdered },
    { name: 'Copilot', path: '/copilot', icon: Bot },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('nexus_jwt_token');
    navigate('/login');
  };

  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-wrapper">
      {/* Mobile Toggle Bar */}
      <div 
        style={{
          display: 'none',
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 200,
          background: 'var(--bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          padding: '6px',
          cursor: 'pointer'
        }}
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </div>

      {/* Sidebar Panel */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-brand">
            <Bot size={22} color="var(--color-brand)" />
            <span>NEXUS</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isPathActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar-initials">JD</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">John Doe</div>
            <a onClick={handleLogout} className="sidebar-logout-link">Logout</a>
          </div>
          <LogOut 
            size={14} 
            color="var(--color-text-secondary)" 
            style={{ cursor: 'pointer' }}
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="main-content-layout">
        <header className="header-bar">
          <h2 className="header-title">{pageTitle}</h2>
          <div className="header-actions">
            <button 
              className="header-bell"
              onClick={toggleTheme}
              style={{ marginRight: '4px' }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              className="header-bell"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} />
              <span className="header-bell-dot"></span>
            </button>
            <div 
              className="user-avatar-initials" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/settings')}
            >
              JD
            </div>
          </div>
        </header>

        <main className="content-container">
          {children}
        </main>
      </div>

      {/* Inject custom mobile toggle layout overrides */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block !important;
          }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.2s ease-in-out;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .header-bar {
            padding-left: 56px;
          }
        }
      `}</style>
    </div>
  );
}

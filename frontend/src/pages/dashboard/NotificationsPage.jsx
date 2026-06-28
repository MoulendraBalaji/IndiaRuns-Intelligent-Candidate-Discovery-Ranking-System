import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { Bell, FileCheck, RefreshCw, Info, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const data = await api.getNotifications();
      setNotifications(data);
      setLoading(false);
    }
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const updated = await api.markAllNotificationsRead();
    setNotifications([...updated]);
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'All') return notifications;
    return notifications.filter(n => n.type === activeTab.toLowerCase());
  };

  const renderIcon = (type) => {
    const style = {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    if (type === 'shortlist') {
      return (
        <div style={{ ...style, backgroundColor: 'var(--color-nav-active)', color: 'var(--color-brand)' }}>
          <FileCheck size={18} />
        </div>
      );
    }
    if (type === 'processing') {
      return (
        <div style={{ ...style, backgroundColor: '#FEF8F0', color: 'var(--color-accent)' }}>
          <RefreshCw size={18} />
        </div>
      );
    }
    return (
      <div style={{ ...style, backgroundColor: 'var(--color-tag-bg)', color: 'var(--color-text-secondary)' }}>
        <Info size={18} />
      </div>
    );
  };

  const filtered = getFilteredNotifications();

  return (
    <Layout pageTitle="Notifications">
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>System Alerts</h3>
        {notifications.some(n => n.unread) && (
          <button 
            onClick={handleMarkAllRead} 
            className="btn btn-outline btn-small"
            style={{ border: 'none', background: 'none', padding: 0 }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div 
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '24px',
          gap: '24px'
        }}
      >
        {['All', 'Shortlists', 'Processing', 'System'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                background: 'none',
                padding: '12px 4px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading notifications...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
          <Bell size={40} color="var(--color-text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>No notifications found</h3>
          <p className="text-muted text-small" style={{ marginTop: '4px' }}>We'll notify you here when AI analytics reports and parsing runs are complete.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((item) => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: item.unread ? '#FDF8F6' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {renderIcon(item.type)}
                <div>
                  <div style={{ fontWeight: item.unread ? 600 : 500, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </div>
                  <div className="text-muted text-small" style={{ marginTop: '2px' }}>
                    {item.description}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="text-muted text-small">{item.timestamp}</span>
                {item.unread && (
                  <div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand)'
                    }}
                  ></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

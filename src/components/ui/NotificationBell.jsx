"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/data/useNotifications';
import './NotificationBell.css';
import { Bell, Check } from '@/lib/icons';

/**
 * NotificationBell — Presentation component.
 * All Firestore logic lives in useNotifications().
 */
const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) {
      router.push(notif.link);
      setIsOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="notif-bell-container" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notif-bell-btn"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="notif-mark-all">
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>
          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={24} className="notif-empty-icon" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`notif-item ${!notif.read ? 'notif-unread' : ''}`}
                  >
                    <div className="notif-content">
                      <p className="notif-title">{notif.title}</p>
                      <p className="notif-message">{notif.message}</p>
                      <p className="notif-time">
                        {notif.createdAt?.toDate
                          ? notif.createdAt.toDate().toLocaleString(undefined, {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : 'Just now'}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="notif-actions">
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                          className="notif-action-btn"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="notif-dropdown-footer">
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
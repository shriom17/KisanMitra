import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [user?.profile_image]);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out of KisanMitra?')) return;
    const result = await logout();
    if (result.success) {
      navigate('/');
      setIsOpen(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    setIsOpen(false);
  };

  return (
    <div className="profile-dropdown">
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="profile-button"
      >
        <div className="profile-avatar">
          {user?.profile_image && !photoError ? (
            <img
              src={user.profile_image}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setPhotoError(true)}
            />
          ) : getInitials(user?.full_name || user?.email?.split('@')[0] || 'User')}
        </div>
        <span className="profile-name">
          {user?.full_name?.split(' ')[0] || 'User'}
        </span>
        <svg
          className={`profile-arrow ${isOpen ? 'rotated' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {/* User Info */}
          <div className="user-info">
            <div className="user-info-content">
              <div className="user-avatar-large">
                {user?.profile_image && !photoError ? (
                  <img
                    src={user.profile_image}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                  />
                ) : getInitials(user?.full_name || user?.email?.split('@')[0] || 'User')}
              </div>
              <div className="user-details">
                <p className="user-name">{user?.full_name}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="menu-items">
            <button
              onClick={handleDashboardClick}
              className="menu-item"
            >
              <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
              <span>{t('navbar.dashboard')}</span>
            </button>

            <button
              onClick={handleProfileClick}
              className="menu-item"
            >
              <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t('navbar.profile')}</span>
            </button>

            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="menu-item"
            >
              <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t('navbar.settings')}</span>
            </button>

            <hr className="menu-divider" />

            <button
              onClick={handleLogout}
              className="menu-item logout-item"
            >
              <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t('navbar.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileDropdown;

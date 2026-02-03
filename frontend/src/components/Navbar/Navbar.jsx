import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css'; 
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'; 
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get user type (default to farmer if not set)
  const userType = user?.userType || 'farmer';
  const isFarmer = userType === 'farmer';
  const isCustomer = userType === 'customer';  
  console.log('🧭 Navbar - User:', user);
  console.log('🧭 Navbar - userType:', userType, 'isFarmer:', isFarmer);
  return (
    <nav className="navbar">

      <div className="navbar-container">
        {/* Hamburger button - visible only on mobile via CSS */}
        <button
          className={`mobile-menu-btn${isMenuOpen ? ' active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src="/logo192.png" alt="KisanMitra Logo" className="logo-image" />
            <h2>KisanMitra</h2>
          </Link>
        </div>

        {/* Desktop menu only */}
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>{t('navbar.home')}</Link>
          </li>
          
          {/* Farmer-only menu items */}
          {isFarmer && (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>{t('navbar.dashboard')}</Link>
              </li>
              <li className="navbar-item">
                <Link to="/agrifarm" className={`navbar-link ${isActive('/agrifarm') ? 'active' : ''}`}>{t('navbar.contract_farming')}</Link>
              </li>
              <li className="navbar-item">
                <Link to="/government-schemes" className={`navbar-link ${isActive('/government-schemes') ? 'active' : ''}`}>{t('navbar.government')}</Link>
              </li>
              <li className="navbar-item">
                <Link to="/kheti-saath" className={`navbar-link ${isActive('/kheti-saath') ? 'active' : ''}`}>{t('navbar.kheti_saath')}</Link>
              </li>
              <li className="navbar-item">
                <Link to="/contacts" className={`navbar-link ${isActive('/contacts') ? 'active' : ''}`}>{t('navbar.contact_ado')}</Link>
              </li>
              <li className="navbar-item">
                <Link to="/marketplace" className={`navbar-link ${isActive('/marketplace') ? 'active' : ''}`}>🛒 {t('navbar.marketplace')}</Link>
              </li>
            </>
          )}
          
          {/* Visible to all users */}
          <li className="navbar-item">
            <Link to="/market-prices" className={`navbar-link ${isActive('/market-prices') ? 'active' : ''}`}>{t('navbar.market_prices')}</Link>
          </li>
          
          {/* Customer-only menu items */}
          {isCustomer && (
            <>
              <li className="navbar-item">
                <Link to="/customer-marketplace" className={`navbar-link ${isActive('/customer-marketplace') ? 'active' : ''}`}>🌾 Shop Fresh</Link>
              </li>
              <li className="navbar-item">
                <Link to="/my-orders" className={`navbar-link ${isActive('/my-orders') ? 'active' : ''}`}>📦 My Orders</Link>
              </li>
            </>
          )}
          
          <li className="navbar-item">
            <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>{t('navbar.about')}</Link>
          </li>
          
        </ul>

        <div className="navbar-auth">
          <LanguageSwitcher />
          {!loading && (
            <>
              {user ? (
                <div className="auth-section authenticated">
                  <ProfileDropdown />
                </div>
              ) : (
                <div className="auth-section unauthenticated">
                  <Link to="/login" className="login-btn">{t('navbar.login')}</Link>
                  <Link to="/signup" className="signup-btn">{t('navbar.signup')}</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu (only visible on mobile via CSS) */}
      {isMenuOpen && (
        <div className="mobile-dropdown-menu">
          <ul>
            <li><Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>{t('navbar.home')}</Link></li>
            
            {/* Farmer-only mobile menu items */}
            {isFarmer && (
              <>
                <li><Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>{t('navbar.dashboard')}</Link></li>
                <li><Link to="/agrifarm" className={`navbar-link ${isActive('/agrifarm') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>🌾 {t('navbar.contract_farming')}</Link></li>
                <li><Link to="/government-schemes" className={`navbar-link ${isActive('/government-schemes') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>{t('navbar.government')}</Link></li>
                <li><Link to="/kheti-saath" className={`navbar-link ${isActive('/kheti-saath') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>🚜 {t('navbar.kheti_saath')}</Link></li>
                <li><Link to="/contacts" className={`navbar-link ${isActive('/contacts') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>👨‍🌾 {t('navbar.contact_ado')}</Link></li>
                <li><Link to="/marketplace" className={`navbar-link ${isActive('/marketplace') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>🛒 {t('navbar.marketplace')}</Link></li>
              </>
            )}
            
            {/* Visible to all users */}
            <li><Link to="/market-prices" className={`navbar-link ${isActive('/market-prices') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>📊 {t('navbar.market_prices')}</Link></li>
            
            {/* Customer-only mobile menu items */}
            {isCustomer && (
              <>
                <li><Link to="/customer-marketplace" className={`navbar-link ${isActive('/customer-marketplace') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>🌾 Shop Fresh</Link></li>
                <li><Link to="/my-orders" className={`navbar-link ${isActive('/my-orders') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>📦 My Orders</Link></li>
              </>
            )}
            
            <li><Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>{t('navbar.about')}</Link></li>
          </ul>
          {/* Auth section for mobile dropdown */}
          {!loading && !user && (
            <div className="mobile-auth-section">
              <Link to="/login" className="login-btn" onClick={() => setIsMenuOpen(false)}>{t('navbar.login')}</Link>
              <Link to="/signup" className="signup-btn" onClick={() => setIsMenuOpen(false)}>{t('navbar.signup')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

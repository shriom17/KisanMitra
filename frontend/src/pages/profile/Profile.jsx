import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Droplets,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Sprout,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const emptyForm = {
  full_name: '',
  phone: '',
  farm_location: '',
  farm_size: '',
  crops: [],
  farm_health: {
    soil_ph: '',
    soil_health_score: '',
    last_pest_inspection: '',
    pest_issues: [],
    irrigation_system: '',
    fertilizer_usage: '',
    disease_history: [],
    overall_health_status: 'good'
  }
};

const cropOptions = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Sugarcane', 'Pulses', 'Vegetables', 'Fruits'];

const getInitials = (name = '') => {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('');
  return (initials || 'KM').toUpperCase();
};

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateProfile, logout, checkAuthStatus } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!user) return;
    const profile = user.profile || {};
    setFormData({
      full_name: user.full_name || '',
      phone: user.phone || '',
      farm_location: profile.farm_location || '',
      farm_size: profile.farm_size || '',
      crops: Array.isArray(profile.crops) ? profile.crops : [],
      farm_health: {
        soil_ph: profile.farm_health?.soil_ph || '',
        soil_health_score: profile.farm_health?.soil_health_score || '',
        last_pest_inspection: profile.farm_health?.last_pest_inspection || '',
        pest_issues: Array.isArray(profile.farm_health?.pest_issues) ? profile.farm_health.pest_issues : [],
        irrigation_system: profile.farm_health?.irrigation_system || '',
        fertilizer_usage: profile.farm_health?.fertilizer_usage || '',
        disease_history: Array.isArray(profile.farm_health?.disease_history) ? profile.farm_health.disease_history : [],
        overall_health_status: profile.farm_health?.overall_health_status || 'good'
      }
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const toggleArrayValue = (field, value, nested = false) => {
    setFormData(current => {
      if (nested) {
        const values = current.farm_health[field] || [];
        return {
          ...current,
          farm_health: {
            ...current.farm_health,
            [field]: values.includes(value) ? values.filter(item => item !== value) : [...values, value]
          }
        };
      }
      const values = current[field] || [];
      return { ...current, [field]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
    });
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setProfileError('');

    const profileData = {
      full_name: formData.full_name,
      phone: formData.phone,
      profile: {
        farm_location: formData.farm_location,
        farm_size: formData.farm_size,
        crops: formData.crops,
        farm_health: formData.farm_health
      }
    };

    const result = await updateProfile(profileData);
    if (result.success) {
      setNotice({ type: 'success', text: result.message || 'Profile updated successfully.' });
      setIsEditing(false);
    } else {
      setNotice({ type: 'error', text: result.message || 'Unable to update profile.' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out of KisanMitra?')) return;
    const result = await logout();
    if (result.success) navigate('/login');
  };

  const retryProfile = async () => {
    setProfileError('');
    await checkAuthStatus();
  };

  if (authLoading) {
    return (
      <main className="profile-page">
        <div className="profile-loading" role="status">
          <span className="profile-spinner" />
          <span>Loading your profile...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-empty" role="alert">
          <ShieldCheck size={34} />
          <h1>Profile unavailable</h1>
          <p>{profileError || 'Your session could not be verified.'}</p>
          <button type="button" className="profile-primary-button" onClick={retryProfile}>Try again</button>
        </section>
      </main>
    );
  }

  const profile = user.profile || {};
  const health = profile.farm_health || {};
  const displayName = user.full_name || user.email?.split('@')[0] || 'KisanMitra User';

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <section className="profile-hero" aria-labelledby="profile-name">
          <div className="profile-hero-pattern" />
          <div className="profile-identity">
            {user.profile_image ? (
              <img className="profile-photo" src={user.profile_image} alt={`${displayName}'s profile`} />
            ) : (
              <div className="profile-photo profile-initials" aria-label={`${displayName} initials`}>
                {getInitials(displayName)}
              </div>
            )}
            <div className="profile-identity-copy">
              <span className="profile-role"><Sprout size={14} /> {user.userType === 'farmer' ? 'Farmer account' : 'Member account'}</span>
              <h1 id="profile-name">{displayName}</h1>
              <p>{user.email || 'Email not available'}</p>
            </div>
          </div>
          <button type="button" className="profile-edit-button" onClick={() => setIsEditing(true)}>
            <Pencil size={17} /> Edit Profile
          </button>
        </section>

        {notice && (
          <div className={`profile-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
            {notice.text}
            <button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={16} /></button>
          </div>
        )}

        <div className="profile-grid">
          <section className="profile-card profile-details-card" aria-labelledby="personal-details-heading">
            <div className="profile-card-heading">
              <div>
                <span className="profile-card-kicker">Personal</span>
                <h2 id="personal-details-heading">Profile information</h2>
              </div>
            </div>
            <div className="profile-detail-list">
              <div className="profile-detail">
                <span className="profile-detail-icon"><Mail size={19} /></span>
                <div><span>Email address</span><strong>{user.email || 'Not provided'}</strong></div>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-icon"><Phone size={19} /></span>
                <div><span>Phone number</span><strong>{user.phone || 'Not provided'}</strong></div>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-icon"><MapPin size={19} /></span>
                <div><span>Farm location</span><strong>{profile.farm_location || 'Not provided'}</strong></div>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-icon"><CalendarDays size={19} /></span>
                <div><span>Member since</span><strong>{formatDate(user.created_at)}</strong></div>
              </div>
            </div>
          </section>

          <section className="profile-card farm-summary-card" aria-labelledby="farm-summary-heading">
            <div className="profile-card-heading">
              <div>
                <span className="profile-card-kicker">Farm overview</span>
                <h2 id="farm-summary-heading">My farm</h2>
              </div>
              <Leaf size={22} />
            </div>
            <div className="farm-stat-grid">
              <div className="farm-stat"><span>Farm size</span><strong>{profile.farm_size || 'Not set'}</strong></div>
              <div className="farm-stat"><span>Soil health</span><strong>{health.soil_health_score ? `${health.soil_health_score}%` : 'Not set'}</strong></div>
            </div>
            <div className="crop-summary">
              <span>Growing crops</span>
              {Array.isArray(profile.crops) && profile.crops.length ? (
                <div className="crop-tags">{profile.crops.map(crop => <span key={crop}>{crop}</span>)}</div>
              ) : <p>No crops added yet.</p>}
            </div>
          </section>

          <section className="profile-card profile-actions-card" aria-labelledby="account-actions-heading">
            <div className="profile-card-heading">
              <div>
                <span className="profile-card-kicker">Account</span>
                <h2 id="account-actions-heading">Account actions</h2>
              </div>
            </div>
            <button type="button" className="profile-logout-button" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </section>
        </div>

        {isEditing && (
          <div className="profile-modal-backdrop" role="presentation" onMouseDown={event => {
            if (event.target === event.currentTarget) setIsEditing(false);
          }}>
            <section className="profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
              <div className="profile-modal-header">
                <div>
                  <span className="profile-card-kicker">Update details</span>
                  <h2 id="edit-profile-title">Edit profile</h2>
                </div>
                <button type="button" className="profile-icon-button" aria-label="Close edit profile" onClick={() => setIsEditing(false)}><X size={20} /></button>
              </div>
              <form onSubmit={saveProfile}>
                <div className="profile-modal-content">
                  <div className="profile-form-grid">
                    <label>Full name
                      <input name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </label>
                    <label>Phone number
                      <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
                    </label>
                    <label>Farm location
                      <input name="farm_location" value={formData.farm_location} onChange={handleChange} placeholder="Village, district, state" />
                    </label>
                    <label>Farm size
                      <input name="farm_size" value={formData.farm_size} onChange={handleChange} placeholder="e.g. 4 acres" />
                    </label>
                  </div>

                  <fieldset className="profile-crop-fieldset">
                    <legend>Growing crops</legend>
                    <div className="profile-crop-options">
                      {cropOptions.map(crop => (
                        <label key={crop} className={formData.crops.includes(crop) ? 'selected' : ''}>
                          <input type="checkbox" checked={formData.crops.includes(crop)} onChange={() => toggleArrayValue('crops', crop)} />
                          {crop}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="profile-health-fieldset">
                    <legend><Droplets size={17} /> Farm health</legend>
                    <div className="profile-form-grid">
                      <label>Soil pH
                        <input type="number" min="0" max="14" step="0.1" value={formData.farm_health.soil_ph} onChange={event => setFormData(current => ({ ...current, farm_health: { ...current.farm_health, soil_ph: event.target.value } }))} />
                      </label>
                      <label>Soil health score
                        <input type="number" min="0" max="100" value={formData.farm_health.soil_health_score} onChange={event => setFormData(current => ({ ...current, farm_health: { ...current.farm_health, soil_health_score: event.target.value } }))} />
                      </label>
                      <label>Irrigation
                        <select value={formData.farm_health.irrigation_system} onChange={event => setFormData(current => ({ ...current, farm_health: { ...current.farm_health, irrigation_system: event.target.value } }))}>
                          <option value="">Select system</option>
                          <option value="drip">Drip</option>
                          <option value="sprinkler">Sprinkler</option>
                          <option value="flood">Flood</option>
                          <option value="manual">Manual</option>
                        </select>
                      </label>
                      <label>Overall health
                        <select value={formData.farm_health.overall_health_status} onChange={event => setFormData(current => ({ ...current, farm_health: { ...current.farm_health, overall_health_status: event.target.value } }))}>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Needs attention</option>
                        </select>
                      </label>
                    </div>
                  </fieldset>
                </div>
                <div className="profile-modal-footer">
                  <button type="button" className="profile-secondary-button" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="profile-primary-button" disabled={saving}><Save size={17} /> {saving ? 'Saving...' : 'Save changes'}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;

import React from 'react'
import { useTranslation } from 'react-i18next'
import './about.css'
import Navbar from '../../components/Navbar/Navbar'

const About = () => {
  const { t } = useTranslation('common');
  
  return (
    <div className='About'>
        <Navbar />
        <div className='about-container'>
            <h1 className='about-title'>{t('about.title')}</h1>
            <p className='about-description'>
                {t('about.description')}
            </p>
            <div className='about-features-title'>
                <h2>{t('about.features_title')}</h2>
            <ul className='about-features-list'>
                <li>{t('about.features.accuracy')}</li>
                <li>{t('about.features.weather_support')}</li>
                <li>{t('about.features.expert_guidance')}</li>
                <li>{t('about.features.community')}</li>
            </ul>
            </div>
            
            {/* Video Section */}
            <div className='about-video-section'>
                <h2 className='video-section-title'>Experience KisanMitra</h2>
                <div className='video-container'>
                    <video 
                        className='about-video'
                        controls
                        playsInline
                        preload="metadata"
                        onError={(e) => {
                            // Hide video if it fails to load
                            e.target.parentElement.style.display = 'none';
                        }}
                    >
                        <source src="/videos/about-video.mp4" type="video/mp4" />
                        <p>Your browser does not support the video tag.</p>
                    </video>
                </div>
            </div>
            
            <div className='our-services'>
                <h2>{t('about.services_title')}</h2>
                <ul className='services-list'>
                    <li>{t('about.services.crop_analysis')}</li>
                    <li>{t('about.services.weather_forecasting')}</li>
                    <li>{t('about.services.soil_monitoring')}</li>
                    <li>{t('about.services.pest_management')}</li>
                </ul>
            </div>
            <div className='mission'>
                <h2>{t('about.mission')}</h2>
                <p>
                    {t('about.mission_text')}
                    </p>
            </div>
        </div>
        {/* Star Rating and Feedback Section */}
        <div className="about-feedback-section" style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#694615ff', borderRadius: '12px', border: '1.5px solid #dbeafe', boxShadow: '0 2px 8px rgba(42,123,228,0.06)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Rate &amp; Give Feedback</h2>
          <StarRating />
          <FeedbackBox />
        </div>
    </div>
  )
}

// Star Rating Component
function StarRating() {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  return (
    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{ cursor: 'pointer', color: (hover || rating) >= star ? '#FFD700' : '#ccc', transition: 'color 0.2s' }}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={star + ' star'}
        >★</span>
      ))}
      {rating > 0 && <span style={{ marginLeft: '1rem', fontSize: '1.1rem', color: 'white' }}>({rating} / 5)</span>}
    </div>
  );
}

// Feedback Box Component
function FeedbackBox() {
  const [feedback, setFeedback] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim().length > 0) {
      setSubmitted(true);
      setFeedback('');
    }
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Share your feedback..."
        rows={3}
        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #dbeafe', resize: 'vertical', fontSize: '1rem' }}
      />
      <button type="submit" style={{ alignSelf: 'flex-start', background: '#1a5bbf', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Submit</button>
      {submitted && <span style={{ color: '#8ea890ff', fontWeight: 'bold' }}>Thank you for your feedback!</span>}
    </form>
  );
}

export default About
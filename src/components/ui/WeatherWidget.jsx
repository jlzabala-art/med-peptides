"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Moon, AlertCircle, MapPin } from '@/lib/icons';

// Simple mapping from OpenWeather icon codes to Lucide icons
const getWeatherIcon = (iconCode, size = 20) => {
  if (!iconCode) return <Cloud size={size} />;
  
  // Icon code format is usually 2 digits followed by 'd' (day) or 'n' (night), e.g., '01d'
  const isNight = iconCode.endsWith('n');
  const code = iconCode.substring(0, 2);

  switch (code) {
    case '01': // clear sky
      return isNight ? <Moon size={size} /> : <Sun size={size} />;
    case '02': // few clouds
    case '03': // scattered clouds
    case '04': // broken clouds
      return <Cloud size={size} />;
    case '09': // shower rain
    case '10': // rain
      return <CloudRain size={size} />;
    case '11': // thunderstorm
      return <CloudLightning size={size} />;
    case '13': // snow
      return <CloudSnow size={size} />;
    case '50': // mist
      return <Cloud size={size} />;
    default:
      return <Cloud size={size} />;
  }
};

const getBackgroundGradients = (condition) => {
  const c = (condition || '').toLowerCase();
  
  if (c.includes('clear')) {
    return 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(14, 165, 233, 0.2))';
  } else if (c.includes('cloud')) {
    return 'linear-gradient(135deg, rgba(148, 163, 184, 0.1), rgba(100, 116, 139, 0.2))';
  } else if (c.includes('rain') || c.includes('drizzle')) {
    return 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(59, 130, 246, 0.25))';
  } else if (c.includes('snow')) {
    return 'linear-gradient(135deg, rgba(226, 232, 240, 0.3), rgba(241, 245, 249, 0.5))';
  } else if (c.includes('thunderstorm')) {
    return 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(76, 29, 149, 0.25))';
  }
  
  return 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))'; // default glass
};

export default function WeatherWidget({ isMobile = false }) {
  const { userProfile } = useAuth();
  const { weatherDisplay } = usePreferences();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check preferences: hide if set to 'hidden'
    if (weatherDisplay === 'hidden') {
      return; 
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = '/api/weather/current';
        
        // If user profile has a city, pass it as fallback or priority based on settings
        if (userProfile?.city) {
          url += `?city=${encodeURIComponent(userProfile.city)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Weather service unavailable');
        }
        
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.warn('WeatherWidget fetch error:', err);
        setError('Weather currently unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh every 30 minutes in background
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userProfile?.city, weatherDisplay]);

  // Handle hidden state
  if (weatherDisplay === 'hidden') return null;

  // Render skeleton during load
  if (loading && !data) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(0,0,0,0.05)',
          minWidth: '140px',
          height: '42px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
        }}
      >
        <div className="skeleton-line" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="skeleton-line" style={{ width: '40px', height: '12px', background: 'rgba(0,0,0,0.1)' }} />
          <div className="skeleton-line" style={{ width: '60px', height: '10px', background: 'rgba(0,0,0,0.1)' }} />
        </div>
      </div>
    );
  }

  // Render error/unavailable state
  if (error || !data) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '16px',
          background: 'rgba(241, 245, 249, 0.5)',
          border: '1px solid rgba(0,0,0,0.05)',
          color: 'var(--color-text-secondary)',
          fontSize: '0.75rem',
          height: '42px'
        }}
        title="Weather service is currently unavailable"
      >
        <AlertCircle size={16} />
        <span style={{ display: isMobile ? 'none' : 'inline' }}>Weather unavailable</span>
      </div>
    );
  }

  const { location, weather, updatedAt } = data;
  const bgGradient = getBackgroundGradients(weather.condition);

  // Time diff for title tooltip
  const lastUpdated = new Date(updatedAt);
  const diffMins = Math.round((new Date() - lastUpdated) / 60000);
  const timeText = diffMins === 0 ? 'Just now' : `${diffMins} min ago`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '24px', // pill shape
        background: bgGradient,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'default',
        transition: 'all 0.3s ease',
        minWidth: isMobile ? 'auto' : '160px',
        height: '42px',
        overflow: 'hidden'
      }}
      title={`${weather.description} (Feels like ${weather.feelsLikeC}°C)\nUpdated: ${timeText}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--color-text-primary)' 
      }}>
        {getWeatherIcon(weather.icon, 22)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: '4px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            color: 'var(--color-text-primary)',
            lineHeight: 1
          }}>
            {weather.temperatureC}°C
          </span>
          {!isMobile && (
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {weather.condition}
            </span>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '3px',
          marginTop: '2px'
        }}>
          <MapPin size={10} color="var(--color-text-tertiary)" />
          <span style={{ 
            fontSize: '0.65rem', 
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isMobile ? '60px' : '100px'
          }}>
            {location.city}, {location.country}
          </span>
        </div>
      </div>
    </div>
  );
}

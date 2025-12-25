import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TravelGlobe from '../components/TravelGlobe';

function Travel() {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column'
    },
    nav: {
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 3rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center'
    },
    logo: {
      fontSize: '20px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      color: 'var(--color-accent)',
      textDecoration: 'none'
    },
    content: {
      flex: 1,
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    },
    sidebar: {
        width: '400px',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '3rem 2rem',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 100
      },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      letterSpacing: '-0.02em',
      color: 'var(--color-text-primary)',
      marginBottom: '1rem'
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      fontWeight: '500',
      marginBottom: '1rem'
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '6px',
      border: '1px solid var(--color-accent)',
      background: 'transparent',
      color: 'var(--color-accent)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '2rem'
    },
    tripCard: {
      background: 'var(--color-tint-blue)',
      padding: '1.25rem',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      marginBottom: '1rem'
    },
    tripName: {
      fontSize: '15px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.5rem'
    },
    tripDate: {
      fontSize: '12px',
      color: 'var(--color-text-secondary)'
    },
    globeContainer: {
      flex: 1,
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden'
    },
    info: {
      position: 'absolute',
      top: '40px',
      left: '40px',
      color: 'var(--color-text-primary)',
      background: 'var(--color-surface)',
      padding: '24px 28px',
      borderRadius: '8px',
      fontSize: '13px',
      zIndex: 100,
      border: '1px solid var(--color-border)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
    },
    infoTitle: {
      margin: '0 0 16px 0',
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      fontWeight: '500',
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    },
    infoText: {
      margin: '10px 0',
      fontSize: '13px',
      color: 'var(--color-text-secondary)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <a href="/dashboard" style={styles.logo}>HAVEN</a>
      </div>

      <div style={styles.content}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <h1 style={styles.title}>Travel</h1>
          <p style={styles.subtitle}>Plan trips and track expenses</p>

          <button
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--color-accent)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--color-accent)';
            }}
          >
            Add Trip
          </button>

          <h3 style={styles.sectionTitle}>Upcoming Trips</h3>
          
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-tertiary)' }}>
            <p style={{ fontSize: '13px' }}>No trips planned yet</p>
          </div>
        </div>

        {/* Globe */}
        <div style={styles.globeContainer}>
          <TravelGlobe />
        </div>
      </div>
    </div>
  );
}

export default Travel;
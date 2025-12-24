import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PlaidLink from '../components/PlaidLink';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchAccounts();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/plaid/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'var(--color-background)'
    },
    nav: {
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 3rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    logo: {
      fontSize: '20px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      color: 'var(--color-accent)'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    },
    navLink: {
      color: 'var(--color-text-secondary)',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'color 0.2s'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '0.5rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '0.5rem 0',
      minWidth: '160px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      zIndex: 1000
    },
    dropdownItem: {
      display: 'block',
      padding: '0.75rem 1.25rem',
      color: 'var(--color-text-secondary)',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.15s ease',
      cursor: 'pointer'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 3rem'
    },
    header: {
      marginBottom: '3.5rem'
    },
    title: {
      fontSize: '42px',
      fontWeight: '300',
      letterSpacing: '-0.03em',
      marginBottom: '0.75rem',
      color: 'var(--color-text-primary)'
    },
    subtitle: {
      fontSize: '16px',
      color: 'var(--color-text-secondary)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: '4rem'
    },
    statCard: {
      background: 'var(--color-surface)',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: '300',
      letterSpacing: '-0.02em',
      marginBottom: '0.5rem',
      color: 'var(--color-text-primary)'
    },
    statLabel: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      fontWeight: '500'
    },
    section: {
      marginBottom: '4rem'
    },
    sectionTitle: {
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      marginBottom: '1.5rem',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: 'var(--color-text-secondary)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.nav}>
          <div style={styles.logo}>HAVEN</div>
        </div>
        <div style={styles.content}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <div style={styles.nav}>
        <div style={styles.logo}>HAVEN</div>
        <div style={styles.navLinks}>
          <a href="#" style={styles.navLink}>Overview</a>
          <a href="#" style={styles.navLink}>Accounts</a>
          <a href="#" style={styles.navLink}>Transactions</a>
          <a href="#" style={styles.navLink}>Subscriptions</a>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                ...styles.navLink,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              More <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {showMoreMenu && (
              <div style={styles.dropdown}>
                {['Gambling', 'Travel', 'Goals', 'Settings'].map(item => (
                  <a
                    key={item}
                    href="#"
                    style={styles.dropdownItem}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--color-background)';
                      e.target.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{ ...styles.navLink, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Financial Overview</h1>
          <p style={styles.subtitle}>December 2024</p>
        </div>

        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, background: 'var(--color-tint-blue)' }}>
            <div style={styles.statValue}>$0</div>
            <div style={styles.statLabel}>Net Worth</div>
          </div>
          <div style={{ ...styles.statCard, background: 'var(--color-tint-green)' }}>
            <div style={styles.statValue}>$0</div>
            <div style={styles.statLabel}>Income</div>
          </div>
          <div style={{ ...styles.statCard, background: 'var(--color-tint-amber)' }}>
            <div style={styles.statValue}>$0</div>
            <div style={styles.statLabel}>Expenses</div>
          </div>
          <div style={{ ...styles.statCard, background: 'var(--color-tint-neutral)' }}>
            <div style={styles.statValue}>$0</div>
            <div style={styles.statLabel}>Gambling</div>
          </div>
        </div>

        {/* Accounts Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Accounts</h2>

          {accounts.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ marginBottom: '1.5rem' }}>No accounts connected yet</p>
              <PlaidLink
                onSuccess={() => {
                  fetchAccounts();
                }}
              />
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                {accounts.map(account => (
                  <div
                    key={account.id}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                        color: 'var(--color-text-primary)'
                      }}>
                        {account.name}
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {account.type} • {account.subtype}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '300',
                        color: 'var(--color-text-primary)'
                      }}>
                        ${Number(account.current_balance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--color-text-tertiary)',
                        marginTop: '0.25rem'
                      }}>
                        Available: ${Number(account.available_balance || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <PlaidLink
                onSuccess={() => {
                  fetchAccounts();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

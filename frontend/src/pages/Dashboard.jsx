import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [gamblingStats, setGamblingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [userRes, accountsRes, transactionsRes, subsRes, gamblingRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/plaid/accounts'),
        api.get('/transactions/?limit=5'),
        api.get('/subscriptions/'),
        api.get('/gambling/stats').catch(() => ({ data: null }))
      ]);
      
      setUser(userRes.data);
      setAccounts(accountsRes.data);
      setTransactions(transactionsRes.data);
      setSubscriptions(subsRes.data);
      setGamblingStats(gamblingRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleSync = async () => {
    try {
      await api.post('/transactions/sync');
      fetchAllData();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const calculateNetWorth = () => {
    return accounts.reduce((sum, acc) => {
      const balance = parseFloat(acc.current_balance || 0);
      // Credit cards are negative (debt)
      return acc.type === 'credit' ? sum - Math.abs(balance) : sum + balance;
    }, 0);
  };

  const calculateMonthlyIncome = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => {
        const txnDate = new Date(t.date);
        return txnDate >= firstDay && parseFloat(t.amount) > 0;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const calculateMonthlyExpenses = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Math.abs(transactions
      .filter(t => {
        const txnDate = new Date(t.date);
        return txnDate >= firstDay && parseFloat(t.amount) < 0;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0));
  };

  const calculateMonthlySubscriptions = () => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const amount = parseFloat(s.amount);
        if (s.billing_cycle === 'monthly') return sum + amount;
        if (s.billing_cycle === 'yearly') return sum + (amount / 12);
        if (s.billing_cycle === 'quarterly') return sum + (amount / 3);
        return sum;
      }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 3rem'
    },
    header: {
      marginBottom: '3.5rem'
    },
    greeting: {
      fontSize: '16px',
      color: 'var(--color-text-secondary)',
      marginBottom: '0.5rem'
    },
    title: {
      fontSize: '42px',
      fontWeight: '300',
      letterSpacing: '-0.03em',
      color: 'var(--color-text-primary)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: '4rem'
    },
    statCard: {
      background: 'var(--color-surface)',
      padding: '1.75rem',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      transition: 'all 0.3s ease'
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
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      fontWeight: '500'
    },
    viewAll: {
      fontSize: '13px',
      color: 'var(--color-accent)',
      textDecoration: 'none',
      fontWeight: '500'
    },
    transactionList: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    transaction: {
      padding: '1.25rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--color-border)'
    },
    transactionInfo: {
      flex: 1
    },
    transactionName: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.25rem'
    },
    transactionDate: {
      fontSize: '12px',
      color: 'var(--color-text-tertiary)'
    },
    transactionAmount: {
      fontSize: '15px',
      fontWeight: '500'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem'
    },
    actionCard: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    actionIcon: {
        fontSize: '24px',
        marginBottom: '0.75rem',
        color: 'var(--color-accent)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
    actionLabel: {
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--color-text-secondary)',
      fontWeight: '500'
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

  const netWorth = calculateNetWorth();
  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const subscriptionCost = calculateMonthlySubscriptions();

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <div style={styles.nav}>
        <div style={styles.logo}>HAVEN</div>
        <div style={styles.navLinks}>
          <a href="/dashboard" style={styles.navLink}>Overview</a>
          <a href="/accounts" style={styles.navLink}>Accounts</a>
          <a href="/transactions" style={styles.navLink}>Transactions</a>
          <a href="/subscriptions" style={styles.navLink}>Subscriptions</a>
          
          {/* More Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{...styles.navLink, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}
            >
              More
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
            
            {showMoreMenu && (
              <div style={styles.dropdown}>
                <a 
                  href="/gambling"
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
                  Gambling
                </a>
                <a 
                  href="/travel"
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
                  Travel
                </a>
                <a 
                  href="/goals"
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
                  Goals
                </a>
                <a 
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
                  Settings
                </a>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            style={{...styles.navLink, background: 'none', border: 'none', cursor: 'pointer'}}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.greeting}>Welcome back,</div>
          <h1 style={styles.title}>Financial Overview</h1>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: 'var(--color-tint-blue)'}}>
            <div style={styles.statValue}>{formatCurrency(netWorth)}</div>
            <div style={styles.statLabel}>Net Worth</div>
          </div>
          <div style={{...styles.statCard, background: 'var(--color-tint-green)'}}>
            <div style={styles.statValue}>{formatCurrency(monthlyIncome)}</div>
            <div style={styles.statLabel}>Income (MTD)</div>
          </div>
          <div style={{...styles.statCard, background: 'var(--color-tint-amber)'}}>
            <div style={styles.statValue}>{formatCurrency(monthlyExpenses)}</div>
            <div style={styles.statLabel}>Expenses (MTD)</div>
          </div>
          <div style={{...styles.statCard, background: 'var(--color-tint-neutral)'}}>
            <div style={styles.statValue}>{formatCurrency(subscriptionCost)}</div>
            <div style={styles.statLabel}>Subscriptions</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Activity</h2>
            <a href="/transactions" style={styles.viewAll}>View All →</a>
          </div>
          
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div style={styles.transactionList}>
              {transactions.slice(0, 5).map((txn, index) => (
                <div 
                  key={txn.id} 
                  style={{
                    ...styles.transaction,
                    borderBottom: index === transactions.length - 1 ? 'none' : '1px solid var(--color-border)'
                  }}
                >
                  <div style={styles.transactionInfo}>
                    <div style={styles.transactionName}>{txn.merchant_name || txn.description}</div>
                    <div style={styles.transactionDate}>{formatDate(txn.date)}</div>
                  </div>
                  <div style={{
                    ...styles.transactionAmount,
                    color: parseFloat(txn.amount) > 0 ? 'var(--color-positive)' : 'var(--color-text-primary)'
                  }}>
                    {parseFloat(txn.amount) > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActions}>
            <div
              onClick={handleSync}
              style={styles.actionCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </div>
              <div style={styles.actionLabel}>Sync Transactions</div>
            </div>
            
            <a
              href="/subscriptions"
              style={styles.actionCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={styles.actionLabel}>Add Subscription</div>
            </a>
            
            <a
              href="/gambling"
              style={styles.actionCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="1" width="10" height="10" rx="2"/>
                  <rect x="13" y="13" width="10" height="10" rx="2"/>
                  <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
                  <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <div style={styles.actionLabel}>Log Session</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
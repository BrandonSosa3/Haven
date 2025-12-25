import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PlaidLink from '../components/PlaidLink';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddManual, setShowAddManual] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    current_balance: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/plaid/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts/manual', {
        name: formData.name,
        type: formData.type,
        current_balance: parseFloat(formData.current_balance)
      });
      setShowAddManual(false);
      setFormData({ name: '', type: 'checking', current_balance: '' });
      fetchAccounts();
    } catch (err) {
      console.error('Failed to add manual account:', err);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0);
  };

  const groupAccountsByType = () => {
    const grouped = {
      checking: [],
      savings: [],
      credit: [],
      investment: [],
      cash: []
    };
    
    accounts.forEach(acc => {
      const type = acc.type?.toLowerCase() || 'checking';
      if (grouped[type]) {
        grouped[type].push(acc);
      } else {
        grouped.checking.push(acc);
      }
    });
    
    return grouped;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 3rem'
    },
    header: {
      marginBottom: '3rem'
    },
    title: {
      fontSize: '42px',
      fontWeight: '300',
      letterSpacing: '-0.03em',
      color: 'var(--color-text-primary)',
      marginBottom: '0.5rem'
    },
    totalBalance: {
      fontSize: '18px',
      color: 'var(--color-text-secondary)',
      marginBottom: '2rem'
    },
    balanceAmount: {
      fontSize: '48px',
      fontWeight: '300',
      color: 'var(--color-accent)',
      letterSpacing: '-0.02em'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    button: {
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
      transition: 'all 0.2s ease'
    },
    section: {
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      fontWeight: '500',
      marginBottom: '1.5rem'
    },
    accountCard: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s ease'
    },
    accountInfo: {
      flex: 1
    },
    accountName: {
      fontSize: '16px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.25rem'
    },
    accountType: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--color-text-secondary)'
    },
    accountBalance: {
      textAlign: 'right'
    },
    balance: {
      fontSize: '24px',
      fontWeight: '300',
      color: 'var(--color-text-primary)'
    },
    available: {
      fontSize: '12px',
      color: 'var(--color-text-tertiary)',
      marginTop: '0.25rem'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'var(--color-surface)',
      borderRadius: '12px',
      padding: '2.5rem',
      maxWidth: '500px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '300',
      marginBottom: '2rem',
      color: 'var(--color-text-primary)'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '11px',
      textTransform: 'uppercase',
      marginBottom: '0.5rem',
      fontWeight: '500',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.nav}>
          <a href="/dashboard" style={styles.logo}>HAVEN</a>
        </div>
        <div style={styles.content}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const groupedAccounts = groupAccountsByType();

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <a href="/dashboard" style={styles.logo}>HAVEN</a>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Accounts</h1>
          <div style={styles.totalBalance}>
            <div>Total Balance</div>
            <div style={styles.balanceAmount}>{formatCurrency(getTotalBalance())}</div>
          </div>

          <div style={styles.buttonGroup}>
            <PlaidLink onSuccess={fetchAccounts} />
            <button
              onClick={() => setShowAddManual(true)}
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
              Add Manual Account
            </button>
          </div>
        </div>

        {/* Checking Accounts */}
        {groupedAccounts.checking.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Checking</h2>
            {groupedAccounts.checking.map(account => (
              <div
                key={account.id}
                style={styles.accountCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.accountInfo}>
                  <div style={styles.accountName}>{account.name}</div>
                  <div style={styles.accountType}>{account.subtype || 'checking'}</div>
                </div>
                <div style={styles.accountBalance}>
                  <div style={styles.balance}>{formatCurrency(account.current_balance)}</div>
                  {account.available_balance && (
                    <div style={styles.available}>
                      Available: {formatCurrency(account.available_balance)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Savings Accounts */}
        {groupedAccounts.savings.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Savings</h2>
            {groupedAccounts.savings.map(account => (
              <div
                key={account.id}
                style={styles.accountCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.accountInfo}>
                  <div style={styles.accountName}>{account.name}</div>
                  <div style={styles.accountType}>{account.subtype || 'savings'}</div>
                </div>
                <div style={styles.accountBalance}>
                  <div style={styles.balance}>{formatCurrency(account.current_balance)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Credit Cards */}
        {groupedAccounts.credit.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Credit Cards</h2>
            {groupedAccounts.credit.map(account => (
              <div
                key={account.id}
                style={styles.accountCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.accountInfo}>
                  <div style={styles.accountName}>{account.name}</div>
                  <div style={styles.accountType}>credit card</div>
                </div>
                <div style={styles.accountBalance}>
                  <div style={styles.balance}>{formatCurrency(Math.abs(account.current_balance))}</div>
                  {account.credit_limit > 0 && (
                    <div style={styles.available}>
                      Limit: {formatCurrency(account.credit_limit)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cash Accounts */}
        {groupedAccounts.cash.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Cash</h2>
            {groupedAccounts.cash.map(account => (
              <div
                key={account.id}
                style={styles.accountCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.accountInfo}>
                  <div style={styles.accountName}>{account.name}</div>
                  <div style={styles.accountType}>manual account</div>
                </div>
                <div style={styles.accountBalance}>
                  <div style={styles.balance}>{formatCurrency(account.current_balance)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {accounts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p>No accounts yet. Connect a bank or add a manual account to get started.</p>
          </div>
        )}
      </div>

      {/* Add Manual Account Modal */}
      {showAddManual && (
        <div style={styles.modal} onClick={() => setShowAddManual(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Manual Account</h2>
            
            <form onSubmit={handleAddManual}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="Cash, Wallet, etc."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="cash">Cash</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_balance}
                  onChange={(e) => setFormData({...formData, current_balance: e.target.value})}
                  style={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  style={{...styles.button, flex: 1, border: 'none', background: 'var(--color-accent)', color: 'white'}}
                >
                  Add Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddManual(false)}
                  style={{...styles.button, flex: 1}}
                  onMouseEnter={(e) => e.target.style.background = 'var(--color-background)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
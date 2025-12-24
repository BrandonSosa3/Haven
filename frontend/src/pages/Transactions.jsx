import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/transactions/sync');
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to sync transactions:', err);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(num));
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
      justifyContent: 'space-between'
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '42px',
      fontWeight: '300',
      letterSpacing: '-0.03em',
      color: 'var(--color-text-primary)'
    },
    syncButton: {
      padding: '12px 24px',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '6px',
      border: '1px solid var(--color-accent)',
      background: syncing ? 'var(--color-border)' : 'transparent',
      color: syncing ? 'var(--color-text-tertiary)' : 'var(--color-accent)',
      cursor: syncing ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease'
    },
    table: {
      width: '100%',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    thead: {
      background: 'var(--color-tint-neutral)',
      borderBottom: '1px solid var(--color-border)'
    },
    th: {
      textAlign: 'left',
      padding: '16px 24px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'var(--color-text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    td: {
      padding: '20px 24px',
      fontSize: '14px',
      borderTop: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)'
    },
    row: {
      transition: 'background 0.15s ease'
    },
    category: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--color-text-secondary)',
      background: 'var(--color-accent-light)',
      padding: '4px 10px',
      borderRadius: '4px',
      display: 'inline-block'
    },
    amount: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '14px',
      fontWeight: '400'
    },
    amountPositive: {
      color: 'var(--color-positive)'
    },
    amountNegative: {
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
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <a href="/dashboard" style={styles.logo}>HAVEN</a>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Transactions</h1>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={styles.syncButton}
            onMouseEnter={(e) => !syncing && (e.target.style.background = 'var(--color-accent)', e.target.style.color = 'white')}
            onMouseLeave={(e) => !syncing && (e.target.style.background = 'transparent', e.target.style.color = 'var(--color-accent)')}
          >
            {syncing ? 'Syncing...' : 'Sync Transactions'}
          </button>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p>No transactions yet. Click "Sync Transactions" to fetch your latest transactions.</p>
          </div>
        ) : (
          <div style={styles.table}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Category</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr
                    key={txn.id}
                    style={styles.row}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-tint-neutral)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>{formatDate(txn.date)}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                        {txn.merchant_name || txn.description}
                      </div>
                      {txn.merchant_name && txn.merchant_name !== txn.description && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                          {txn.description}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {txn.category && (
                        <span style={styles.category}>{txn.category.split(',')[0]}</span>
                      )}
                    </td>
                    <td style={{...styles.td, textAlign: 'right'}}>
                      <span style={{
                        ...styles.amount,
                        ...(parseFloat(txn.amount) > 0 ? styles.amountPositive : styles.amountNegative)
                      }}>
                        {parseFloat(txn.amount) > 0 ? '+' : ''}
                        {formatAmount(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billing_cycle: 'monthly',
    next_billing_date: '',
    category: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/');
      setSubscriptions(response.data);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions/', {
        ...formData,
        amount: parseFloat(formData.amount),
        next_billing_date: new Date(formData.next_billing_date).toISOString()
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        amount: '',
        billing_cycle: 'monthly',
        next_billing_date: '',
        category: '',
        notes: ''
      });
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to create subscription:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to delete subscription:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateMonthlyTotal = () => {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const amount = parseFloat(sub.amount);
        if (sub.billing_cycle === 'monthly') return total + amount;
        if (sub.billing_cycle === 'yearly') return total + (amount / 12);
        if (sub.billing_cycle === 'quarterly') return total + (amount / 3);
        return total;
      }, 0);
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
    subtitle: {
      fontSize: '16px',
      color: 'var(--color-text-secondary)',
      marginTop: '0.5rem'
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem'
    },
    card: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '1.5rem',
      transition: 'all 0.2s ease'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.25rem'
    },
    cardCategory: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--color-text-tertiary)'
    },
    amount: {
      fontSize: '28px',
      fontWeight: '300',
      color: 'var(--color-text-primary)',
      marginBottom: '0.5rem'
    },
    cycle: {
      fontSize: '12px',
      color: 'var(--color-text-secondary)',
      textTransform: 'capitalize'
    },
    nextBilling: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--color-border)'
    },
    deleteButton: {
      padding: '6px 12px',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '4px',
      border: '1px solid var(--color-border)',
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
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
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto'
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
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
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

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <a href="/dashboard" style={styles.logo}>HAVEN</a>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Subscriptions</h1>
            <p style={styles.subtitle}>
              ${calculateMonthlyTotal().toFixed(2)}/month total • {subscriptions.filter(s => s.status === 'active').length} active
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
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
            Add Subscription
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p>No subscriptions yet. Click "Add Subscription" to get started.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {subscriptions.map(sub => (
              <div
                key={sub.id}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{sub.name}</h3>
                    {sub.category && <p style={styles.cardCategory}>{sub.category}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    style={styles.deleteButton}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--color-danger)';
                      e.target.style.color = 'var(--color-danger)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                <div style={styles.amount}>
                  ${parseFloat(sub.amount).toFixed(2)}
                </div>
                <div style={styles.cycle}>
                  per {sub.billing_cycle === 'yearly' ? 'year' : sub.billing_cycle === 'quarterly' ? 'quarter' : 'month'}
                </div>
                
                <div style={styles.nextBilling}>
                  Next billing: {formatDate(sub.next_billing_date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Subscription</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="Netflix, Spotify, etc."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={styles.input}
                  placeholder="15.99"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Billing Cycle</label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({...formData, billing_cycle: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Next Billing Date</label>
                <input
                  type="date"
                  value={formData.next_billing_date}
                  onChange={(e) => setFormData({...formData, next_billing_date: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category (Optional)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.input}
                  placeholder="Entertainment, Productivity, etc."
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{...styles.button, flex: 1, border: 'none', background: 'var(--color-accent)', color: 'white'}}
                >
                  Add Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{...styles.button, flex: 1}}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--color-background)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
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

export default Subscriptions;
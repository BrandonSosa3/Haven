import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Gambling() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    game_type: '',
    buy_in: '',
    cash_out: '',
    session_date: '',
    duration_minutes: '',
    notes: '',
    mood: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        api.get('/gambling/'),
        api.get('/gambling/stats')
      ]);
      setSessions(sessionsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch gambling data:', err);
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
      const submitData = {
        platform: formData.platform,
        game_type: formData.game_type,
        buy_in: parseFloat(formData.buy_in),
        cash_out: parseFloat(formData.cash_out),
        session_date: new Date(formData.session_date).toISOString()
      };
      
      // Only include optional fields if they have values
      if (formData.duration_minutes && formData.duration_minutes.trim() !== '') {
        submitData.duration_minutes = parseInt(formData.duration_minutes);
      }
      
      if (formData.notes && formData.notes.trim() !== '') {
        submitData.notes = formData.notes;
      }
      
      if (formData.mood && formData.mood.trim() !== '') {
        submitData.mood = formData.mood;
      }
      
      await api.post('/gambling/', submitData);
      setShowAddModal(false);
      setFormData({
        platform: '',
        game_type: '',
        buy_in: '',
        cash_out: '',
        session_date: '',
        duration_minutes: '',
        notes: '',
        mood: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.delete(`/gambling/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      border: '1px solid var(--color-border)'
    },
    statValue: {
      fontSize: '32px',
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
      cursor: 'pointer'
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
          <h1 style={styles.title}>Gambling Tracker</h1>
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
            Add Session
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, background: 'var(--color-tint-blue)'}}>
              <div style={{
                ...styles.statValue,
                color: stats.net_profit_loss >= 0 ? 'var(--color-positive)' : 'var(--color-warning)'
              }}>
                {formatCurrency(stats.net_profit_loss)}
              </div>
              <div style={styles.statLabel}>Net P/L</div>
            </div>

            <div style={{...styles.statCard, background: 'var(--color-tint-green)'}}>
              <div style={styles.statValue}>{stats.total_sessions}</div>
              <div style={styles.statLabel}>Total Sessions</div>
            </div>

            <div style={{...styles.statCard, background: 'var(--color-tint-amber)'}}>
              <div style={styles.statValue}>{stats.win_rate.toFixed(1)}%</div>
              <div style={styles.statLabel}>Win Rate</div>
            </div>

            <div style={{...styles.statCard, background: 'var(--color-tint-neutral)'}}>
              <div style={styles.statValue}>{formatCurrency(stats.average_session)}</div>
              <div style={styles.statLabel}>Avg Session</div>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p>No sessions yet. Click "Add Session" to track your gambling activity.</p>
          </div>
        ) : (
          <div style={styles.table}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Platform</th>
                  <th style={styles.th}>Game</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Buy-In</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Cash-Out</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Net</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-tint-neutral)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>{formatDate(session.session_date)}</td>
                    <td style={styles.td}>{session.platform}</td>
                    <td style={styles.td}>{session.game_type}</td>
                    <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(session.buy_in)}</td>
                    <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(session.cash_out)}</td>
                    <td style={{
                      ...styles.td,
                      textAlign: 'right',
                      color: session.net_result >= 0 ? 'var(--color-positive)' : 'var(--color-warning)',
                      fontWeight: '500'
                    }}>
                      {session.net_result >= 0 ? '+' : ''}{formatCurrency(session.net_result)}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleDelete(session.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Gambling Session</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Platform</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  style={styles.input}
                  placeholder="DraftKings, FanDuel, etc."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Game Type</label>
                <input
                  type="text"
                  value={formData.game_type}
                  onChange={(e) => setFormData({...formData, game_type: e.target.value})}
                  style={styles.input}
                  placeholder="NFL Parlay, Poker, Blackjack, etc."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Buy-In</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.buy_in}
                  onChange={(e) => setFormData({...formData, buy_in: e.target.value})}
                  style={styles.input}
                  placeholder="50.00"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cash-Out</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cash_out}
                  onChange={(e) => setFormData({...formData, cash_out: e.target.value})}
                  style={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Session Date</label>
                <input
                  type="datetime-local"
                  value={formData.session_date}
                  onChange={(e) => setFormData({...formData, session_date: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{...styles.input, minHeight: '80px'}}
                  placeholder="Tilt bet, good run, etc."
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{...styles.button, flex: 1, border: 'none', background: 'var(--color-accent)', color: 'white'}}
                >
                  Add Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

export default Gambling;
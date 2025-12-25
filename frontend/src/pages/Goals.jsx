import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    category: '',
    notes: ''
  });
  const [updateAmount, setUpdateAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals/');
      setGoals(response.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
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
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0
      };
      
      // Only include optional fields if they have values
      if (formData.target_date && formData.target_date.trim() !== '') {
        submitData.target_date = new Date(formData.target_date).toISOString();
      }
      
      if (formData.category && formData.category.trim() !== '') {
        submitData.category = formData.category;
      }
      
      if (formData.notes && formData.notes.trim() !== '') {
        submitData.notes = formData.notes;
      }
      
      await api.post('/goals/', submitData);
      setShowAddModal(false);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        category: '',
        notes: ''
      });
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    
    try {
      await api.put(`/goals/${selectedGoal.id}`, {
        current_amount: parseFloat(updateAmount)
      });
      setShowUpdateModal(false);
      setSelectedGoal(null);
      setUpdateAmount('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
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
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '2rem'
    },
    goalCard: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '2rem',
      transition: 'all 0.2s ease'
    },
    goalHeader: {
      marginBottom: '1.5rem'
    },
    goalName: {
      fontSize: '20px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.5rem'
    },
    goalCategory: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--color-text-tertiary)'
    },
    goalAmounts: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '1rem'
    },
    currentAmount: {
      fontSize: '32px',
      fontWeight: '300',
      color: 'var(--color-accent)'
    },
    targetAmount: {
      fontSize: '16px',
      color: 'var(--color-text-secondary)'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: 'var(--color-background)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '1rem'
    },
    progressFill: {
      height: '100%',
      background: 'var(--color-accent)',
      transition: 'width 0.3s ease',
      borderRadius: '4px'
    },
    progressText: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)',
      marginBottom: '1.5rem'
    },
    goalFooter: {
      display: 'flex',
      gap: '0.75rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--color-border)'
    },
    smallButton: {
      flex: 1,
      padding: '10px 16px',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '6px',
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
    textarea: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      minHeight: '80px',
      resize: 'vertical'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    completedBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      background: 'var(--color-positive)',
      color: 'white',
      borderRadius: '4px',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      marginBottom: '1rem'
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
          <h1 style={styles.title}>Goals</h1>
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
            Add Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p>No goals yet. Click "Add Goal" to create your first savings goal.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {goals.map(goal => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount);
              const isCompleted = goal.status === 'completed' || progress >= 100;
              
              return (
                <div
                  key={goal.id}
                  style={styles.goalCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.goalHeader}>
                    {isCompleted && <div style={styles.completedBadge}>Completed ✓</div>}
                    <h3 style={styles.goalName}>{goal.name}</h3>
                    {goal.category && <p style={styles.goalCategory}>{goal.category}</p>}
                  </div>

                  <div style={styles.goalAmounts}>
                    <div style={styles.currentAmount}>{formatCurrency(goal.current_amount)}</div>
                    <div style={styles.targetAmount}>of {formatCurrency(goal.target_amount)}</div>
                  </div>

                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${progress}%`}} />
                  </div>

                  <div style={styles.progressText}>
                    {progress.toFixed(1)}% complete
                    {goal.target_date && ` • Target: ${formatDate(goal.target_date)}`}
                  </div>

                  <div style={styles.goalFooter}>
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setUpdateAmount(goal.current_amount.toString());
                        setShowUpdateModal(true);
                      }}
                      style={styles.smallButton}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--color-accent)';
                        e.target.style.color = 'var(--color-accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.color = 'var(--color-text-secondary)';
                      }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      style={styles.smallButton}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#DC2626';
                        e.target.style.color = '#DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.color = 'var(--color-text-secondary)';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Savings Goal</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="Emergency Fund, Vacation, etc."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  style={styles.input}
                  placeholder="5000.00"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                  style={styles.input}
                  placeholder="0.00"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category (Optional)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.input}
                  placeholder="Savings, Travel, House, etc."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={styles.textarea}
                  placeholder="Additional details..."
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{...styles.button, flex: 1, border: 'none', background: 'var(--color-accent)', color: 'white'}}
                >
                  Add Goal
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

      {/* Update Progress Modal */}
      {showUpdateModal && selectedGoal && (
        <div style={styles.modal} onClick={() => setShowUpdateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Update Progress</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              {selectedGoal.name}
            </p>
            
            <form onSubmit={handleUpdateProgress}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{...styles.button, flex: 1, border: 'none', background: 'var(--color-accent)', color: 'white'}}
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
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

export default Goals;
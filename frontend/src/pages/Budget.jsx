import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BudgetPeriodSelector from '../components/budget/BudgetPeriodSelector';
import TransactionCategorizer from '../components/budget/TransactionCategorizer';
import BudgetSummary from '../components/budget/BudgetSummary';

function Budget() {
  const [step, setStep] = useState('loading'); // loading, period-setup, categorization, summary, dashboard
  const [periodConfig, setPeriodConfig] = useState(null);
  const [uncategorizedTxns, setUncategorizedTxns] = useState([]);
  const [currentTxnIndex, setCurrentTxnIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkBudgetStatus();
  }, []);

  const checkBudgetStatus = async () => {
    try {
      // First, check if we have a saved periodConfig - this takes priority
      const savedConfig = localStorage.getItem('budgetPeriodConfig');
      let periodConfig = null;
      if (savedConfig) {
        try {
          periodConfig = JSON.parse(savedConfig);
          setPeriodConfig(periodConfig);
        } catch (e) {
          console.error('Failed to parse saved config:', e);
        }
      }

      const statusRes = await api.get('/budget/check-setup');
      
      if (statusRes.data.has_budget) {
        // User has budget, load dashboard
        try {
          const budgetRes = await api.get('/budget/current');
          setBudget(budgetRes.data);
          setStep('dashboard');
          return; // Exit early if we have a budget
        } catch (budgetErr) {
          // If current budget fetch fails, treat as no budget and continue
          console.error('Failed to fetch current budget:', budgetErr);
        }
      }
      
      // If we have periodConfig saved, always try to load transactions and show categorization
      if (periodConfig) {
        try {
          const [txnsRes, catsRes] = await Promise.all([
            api.get('/budget/uncategorized-transactions').catch(() => ({ data: [] })),
            api.get('/budget/categories').catch(() => ({ data: [] }))
          ]);
          
          setUncategorizedTxns(txnsRes.data || []);
          setCategories(catsRes.data || []);
          
          // Always show categorization if we have periodConfig, even if no transactions
          // The categorizer will handle the empty state
          setStep('categorization');
        } catch (loadErr) {
          console.error('Failed to load transactions/categories:', loadErr);
          // Still show categorization if we have periodConfig
          setStep('categorization');
        }
      } else if (statusRes.data.needs_categorization) {
        // User needs to categorize transactions but no saved config
        const txnsRes = await api.get('/budget/uncategorized-transactions');
        setUncategorizedTxns(txnsRes.data || []);
        
        const catsRes = await api.get('/budget/categories');
        setCategories(catsRes.data || []);
        
        setStep('period-setup');
      } else {
        // No transactions yet
        setStep('no-data');
      }
    } catch (err) {
      console.error('Failed to check budget status:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        // On error, try to load from localStorage
        const savedConfig = localStorage.getItem('budgetPeriodConfig');
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            setPeriodConfig(parsedConfig);
            // Try to load transactions
            api.get('/budget/uncategorized-transactions').then(res => {
              setUncategorizedTxns(res.data || []);
              api.get('/budget/categories').then(catsRes => {
                setCategories(catsRes.data || []);
                setStep('categorization');
              }).catch(() => setStep('categorization'));
            }).catch(() => {
              setStep('categorization');
            });
          } catch {
            setStep('no-data');
          }
        } else {
          setStep('no-data');
        }
      }
    }
  };

  const handlePeriodSetup = (config) => {
    setPeriodConfig(config);
    localStorage.setItem('budgetPeriodConfig', JSON.stringify(config));
    
    // Load uncategorized transactions
    api.get('/budget/uncategorized-transactions').then(res => {
      setUncategorizedTxns(res.data);
    });
    
    // Load categories
    api.get('/budget/categories').then(res => {
      setCategories(res.data);
    });
    
    setStep('categorization');
  };

  const handleCreateCategory = async (bucket, name) => {
    try {
      const res = await api.post('/budget/categories', {
        name: name,
        bucket: bucket
      });
      
      const newCategory = res.data;
      // Check if category already exists in state to avoid duplicates
      const exists = categories.some(
        c => c.id === newCategory.id || 
        (c.name.toLowerCase() === newCategory.name.toLowerCase() && c.bucket === newCategory.bucket)
      );
      
      if (!exists) {
        setCategories([...categories, newCategory]);
      } else {
        // Refresh categories list to ensure we have the latest
        const catsRes = await api.get('/budget/categories');
        setCategories(catsRes.data || []);
      }
      
      return newCategory; // Return it so TransactionCategorizer can use it
    } catch (err) {
      console.error('Failed to create category:', err);
      // If creation fails due to duplicate, refresh categories list
      if (err.response?.status === 400) {
        try {
          const catsRes = await api.get('/budget/categories');
          setCategories(catsRes.data || []);
        } catch (refreshErr) {
          console.error('Failed to refresh categories:', refreshErr);
        }
      }
      throw err;
    }
  };

  const handleCategorize = async (categorization) => {
    const currentTxn = uncategorizedTxns[currentTxnIndex];
    
    if (!currentTxn) {
      console.error('No current transaction to categorize');
      return;
    }
    
    try {
      await api.put(`/budget/transactions/${currentTxn.id}/categorize`, categorization);
      
      // Refresh categories list in case a new one was auto-created
      try {
        const catsRes = await api.get('/budget/categories');
        setCategories(catsRes.data || []);
      } catch (catsErr) {
        console.error('Failed to refresh categories:', catsErr);
      }
      
      // Remove the categorized transaction from the list
      const updatedTxns = uncategorizedTxns.filter((_, idx) => idx !== currentTxnIndex);
      setUncategorizedTxns(updatedTxns);
      
      // Move to next transaction (don't increment index since we removed one)
      if (updatedTxns.length > 0) {
        // Stay at same index (which is now the next transaction)
        if (currentTxnIndex >= updatedTxns.length) {
          setCurrentTxnIndex(updatedTxns.length - 1);
        }
      } else {
        // Check if there are more uncategorized transactions
        try {
          const refreshRes = await api.get('/budget/uncategorized-transactions');
          if (refreshRes.data && refreshRes.data.length > 0) {
            setUncategorizedTxns(refreshRes.data);
            setCurrentTxnIndex(0);
          } else {
            // All done! Show summary
            await loadSummary();
          }
        } catch (refreshErr) {
          // If refresh fails, try to show summary
          await loadSummary();
        }
      }
    } catch (err) {
      console.error('Failed to categorize:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to categorize transaction';
      alert(`Error: ${errorMsg}`);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryRes = await api.get('/budget/pre-budget-summary');
      setSummary(summaryRes.data);
      setStep('summary');
    } catch (err) {
      console.error('Failed to load summary:', err);
      // If summary fails, just create budget
      await createBudget();
    }
  };

  const resetCategorizations = async () => {
    if (!confirm('Are you sure you want to reset all transaction categorizations? This will unassign all transactions.')) {
      return;
    }
    
    try {
      const res = await api.post('/budget/transactions/reset-categorizations');
      alert(`Successfully reset ${res.data.reset_count} transactions`);
      
      // Clear period config to restart
      localStorage.removeItem('budgetPeriodConfig');
      setPeriodConfig(null);
      setSummary(null);
      
      // Reload uncategorized transactions and refresh
      const txnsRes = await api.get('/budget/uncategorized-transactions');
      setUncategorizedTxns(txnsRes.data || []);
      setCurrentTxnIndex(0);
      
      // Reload categories
      const catsRes = await api.get('/budget/categories');
      setCategories(catsRes.data || []);
      
      // Go back to period setup
      setStep('period-setup');
    } catch (err) {
      console.error('Failed to reset categorizations:', err);
      alert('Failed to reset categorizations');
    }
  };

  const resetEverything = async () => {
    if (!confirm('⚠️ WARNING: This will completely reset your budget setup!\n\nThis will:\n- Deactivate all budgets\n- Unassign all transactions\n- Delete all categories\n\nAre you sure you want to continue?')) {
      return;
    }
    
    try {
      const res = await api.post('/budget/reset-all');
      
      // Clear everything from localStorage
      localStorage.removeItem('budgetPeriodConfig');
      
      // Reset all state
      setPeriodConfig(null);
      setSummary(null);
      setBudget(null);
      setCategories([]);
      setUncategorizedTxns([]);
      setCurrentTxnIndex(0);
      
      // Reload and go to period setup
      await checkBudgetStatus();
      
      alert(`Successfully reset everything!\n\n- ${res.data.budgets_deactivated} budgets deactivated\n- ${res.data.transactions_reset} transactions reset\n- ${res.data.categories_deleted} categories deleted`);
    } catch (err) {
      console.error('Failed to reset everything:', err);
      alert('Failed to reset everything');
    }
  };

  const createBudget = async () => {
    try {
      // Use income from summary (which is already filtered to last full month)
      // Or calculate from transactions filtered to last full month
      const now = new Date();
      let lastFullMonth, lastFullYear;
      
      if (now.getMonth() === 0) { // January
        lastFullMonth = 11; // December (0-indexed)
        lastFullYear = now.getFullYear() - 1;
      } else {
        lastFullMonth = now.getMonth() - 1;
        lastFullYear = now.getFullYear();
      }
      
      const firstDay = new Date(lastFullYear, lastFullMonth, 1);
      const lastDay = new Date(lastFullYear, lastFullMonth + 1, 0, 23, 59, 59);
      
      // Get transactions and filter to last full month
      const txnsRes = await api.get('/transactions');
      const totalIncome = txnsRes.data
        .filter(t => {
          const txnDate = new Date(t.date);
          return t.user_bucket === 'income' && 
                 parseFloat(t.amount) > 0 &&
                 txnDate >= firstDay && 
                 txnDate <= lastDay;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      await api.post('/budget/', {
        period_type: periodConfig.periodType,
        has_monthly_obligations: periodConfig.hasMonthlyObligations,
        period_start_date: periodConfig.periodStartDate,
        total_income: totalIncome || 1000, // Default to 1000 if no income found
        needs_percentage: 50,
        wants_percentage: 30,
        savings_percentage: 20
      });
      
      // Clear period config
      localStorage.removeItem('budgetPeriodConfig');
      
      // Reload to dashboard
      window.location.reload();
    } catch (err) {
      console.error('Failed to create budget:', err);
      alert('Failed to create budget');
    }
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
      padding: '3rem 2rem'
    },
    card: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '3rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      marginBottom: '1rem',
      color: 'var(--color-text-primary)'
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      marginBottom: '2rem'
    },
    button: {
      padding: '14px 32px',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '8px',
      border: 'none',
      background: 'var(--color-accent)',
      color: 'white',
      cursor: 'pointer'
    }
  };

  const currentTxn = uncategorizedTxns[currentTxnIndex];
  const progress = uncategorizedTxns.length > 0 ? {
    categorized: currentTxnIndex,
    total: uncategorizedTxns.length
  } : null;

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <a href="/dashboard" style={styles.logo}>HAVEN</a>
      </div>

      <div style={styles.content}>
        {step === 'loading' && (
          <div style={styles.card}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
          </div>
        )}

        {step === 'no-data' && (
          <div style={styles.card}>
            <h1 style={styles.title}>No Transactions Yet</h1>
            <p style={styles.subtitle}>
              Connect your accounts and sync transactions to get started with budgeting.
            </p>
            <button onClick={() => navigate('/dashboard')} style={styles.button}>
              Go to Dashboard
            </button>
          </div>
        )}

        {step === 'period-setup' && (
          <BudgetPeriodSelector onComplete={handlePeriodSetup} />
        )}

        {step === 'categorization' && periodConfig && (
          <>
            <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
              <button
                onClick={resetCategorizations}
                style={{
                  ...styles.button,
                  background: 'var(--color-border)',
                  fontSize: '11px',
                  padding: '8px 16px'
                }}
              >
                Reset All Categorizations
              </button>
            </div>
            {currentTxn ? (
              <TransactionCategorizer
                transaction={currentTxn}
                categories={categories}
                periodType={periodConfig.periodType}
                hasMonthlyObligations={periodConfig.hasMonthlyObligations}
                onCategorize={handleCategorize}
                onCreateCategory={handleCreateCategory}
                progress={progress}
              />
            ) : (
              <div style={styles.card}>
                <h1 style={styles.title}>All Transactions Categorized</h1>
                <p style={styles.subtitle}>
                  Loading summary...
                </p>
              </div>
            )}
          </>
        )}

        {step === 'summary' && summary && periodConfig && (
          <BudgetSummary
            summary={summary}
            periodConfig={periodConfig}
            onCreateBudget={createBudget}
            onBack={() => {
              // Go back to categorization
              api.get('/budget/uncategorized-transactions').then(res => {
                if (res.data && res.data.length > 0) {
                  setUncategorizedTxns(res.data);
                  setCurrentTxnIndex(0);
                  setStep('categorization');
                } else {
                  // No uncategorized, but allow going back
                  setStep('categorization');
                }
              }).catch(() => setStep('categorization'));
            }}
          />
        )}

        {step === 'dashboard' && (
          <div style={styles.card}>
            <h1 style={styles.title}>Budget Dashboard</h1>
            <p style={styles.subtitle}>Coming next...</p>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Testing & Development
              </div>
              <button
                onClick={resetEverything}
                style={{
                  ...styles.button,
                  background: '#dc3545',
                  fontSize: '12px',
                  padding: '10px 20px'
                }}
              >
                Reset Everything & Start Over
              </button>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                This will completely reset your budget setup and allow you to go through the entire flow again from the beginning.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Budget;
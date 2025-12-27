import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BudgetPeriodSelector from '../components/budget/BudgetPeriodSelector';
import TransactionCategorizer from '../components/budget/TransactionCategorizer';
import BudgetDashboard from '../components/budget/BudgetDashboard';
import MonthNavigation from '../components/budget/MonthNavigation';
import TransactionsList from '../components/budget/TransactionsList';

function Budget() {
  const [step, setStep] = useState('loading');
  const [periodConfig, setPeriodConfig] = useState(null);
  const [uncategorizedTxns, setUncategorizedTxns] = useState([]);
  const [currentTxnIndex, setCurrentTxnIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const [budgetHistory, setBudgetHistory] = useState([]); // Add this
  const [selectedBudgetId, setSelectedBudgetId] = useState(null); // Add this
  const [showTransactions, setShowTransactions] = useState(false);
  const [currentMonthTransactions, setCurrentMonthTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkBudgetStatus();
  }, []);

  const checkBudgetStatus = async () => {
    try {
      console.log('[BUDGET] Checking budget status...');

      // Auto-create current month budget if needed
      try {
        const autoCreateRes = await api.post('/budget/auto-create-current-month');
        if (autoCreateRes.data.created) {
          console.log('[BUDGET] Auto-created budget:', autoCreateRes.data.message);
        }
      } catch (autoErr) {
        console.error('[BUDGET] Auto-create failed:', autoErr);
        // Continue anyway
      }
      
      const statusRes = await api.get('/budget/check-setup');
      console.log('[BUDGET] Status:', statusRes.data);
      
      if (statusRes.data.has_budget) {
        // User has an active budget
        console.log('[BUDGET] Budget exists, loading dashboard...');
        const budgetRes = await api.get('/budget/current');
        setBudget(budgetRes.data);
        
        // Load budget history
        const historyRes = await api.get('/budget/history');
        setBudgetHistory(historyRes.data);
        console.log('[BUDGET] History loaded:', historyRes.data.length, 'budgets');
        
        // Load summary for current budget
        const summaryRes = await api.get('/budget/summary');
        setSummary(summaryRes.data);
        setSelectedBudgetId(budgetRes.data.id);
        console.log('[BUDGET] Summary loaded:', summaryRes.data);
        
        // Also load uncategorized count for notification
        if (statusRes.data.needs_categorization) {
          const txnsRes = await api.get('/budget/uncategorized-transactions');
          setUncategorizedTxns(txnsRes.data);
          console.log('[BUDGET] Found', txnsRes.data.length, 'new uncategorized transactions');
        }
        
        setStep('dashboard');
      } else if (statusRes.data.needs_categorization) {
        // First time setup - no budget yet
        console.log('[BUDGET] First time setup - need to categorize...');
        
        const txnsRes = await api.get('/budget/uncategorized-transactions');
        console.log('[BUDGET] Uncategorized transactions:', txnsRes.data.length);
        setUncategorizedTxns(txnsRes.data);
        
        const catsRes = await api.get('/budget/categories');
        console.log('[BUDGET] Existing categories:', catsRes.data.length);
        setCategories(catsRes.data);
        
        // Check if period config exists
        const savedConfig = localStorage.getItem('budgetPeriodConfig');
        
        if (!savedConfig) {
          console.log('[BUDGET] Show period selector');
          setStep('period-setup');
        } else {
          console.log('[BUDGET] Continue to categorization');
          setPeriodConfig(JSON.parse(savedConfig));
          setStep('categorization');
        }
      } else {
        // No transactions yet
        console.log('[BUDGET] No data available');
        setStep('no-data');
      }
    } catch (err) {
      console.error('[BUDGET] Error checking status:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setStep('error');
      }
    }
  };

  const handlePeriodSetup = (config) => {
    console.log('[BUDGET] Period setup completed:', config);
    setPeriodConfig(config);
    localStorage.setItem('budgetPeriodConfig', JSON.stringify(config));
    
    // Load uncategorized transactions
    api.get('/budget/uncategorized-transactions').then(res => {
      console.log('[BUDGET] Loaded transactions for categorization:', res.data.length);
      setUncategorizedTxns(res.data);
    });
    
    // Load categories
    api.get('/budget/categories').then(res => {
      console.log('[BUDGET] Loaded existing categories:', res.data.length);
      setCategories(res.data);
    });
    
    setStep('categorization');
  };

  const handleCreateCategory = async (bucket, name) => {
    try {
      console.log('[BUDGET] Creating category:', { bucket, name });
      const res = await api.post('/budget/categories', {
        name: name,
        bucket: bucket
      });
      
      const newCategory = res.data;
      console.log('[BUDGET] Category created:', newCategory);
      
      // Check if category already exists in state to avoid duplicates
      const exists = categories.some(
        c => c.id === newCategory.id || 
        (c.name.toLowerCase() === newCategory.name.toLowerCase() && c.bucket === newCategory.bucket)
      );
      
      if (!exists) {
        setCategories([...categories, newCategory]);
        console.log('[BUDGET] Category added to state');
      } else {
        console.log('[BUDGET] Category already exists, refreshing list');
        const catsRes = await api.get('/budget/categories');
        setCategories(catsRes.data || []);
      }
      
      return newCategory;
    } catch (err) {
      console.error('[BUDGET] Failed to create category:', err);
      if (err.response?.status === 400) {
        try {
          const catsRes = await api.get('/budget/categories');
          setCategories(catsRes.data || []);
        } catch (refreshErr) {
          console.error('[BUDGET] Failed to refresh categories:', refreshErr);
        }
      }
      throw err;
    }
  };

  const loadCurrentMonthTransactions = async () => {
    try {
      console.log('[BUDGET] Loading transactions for current month...');
      
      // Get the currently selected budget
      const budgetData = budgetHistory.find(b => b.id === selectedBudgetId);
      if (!budgetData) return;
      
      const txnsRes = await api.get('/transactions');
      
      // Filter to current month
      const periodStart = new Date(budgetData.period_start);
      const periodEnd = new Date(budgetData.period_end);
      
      const monthTransactions = txnsRes.data.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate >= periodStart && txnDate <= periodEnd;
      });
      
      console.log('[BUDGET] Found', monthTransactions.length, 'transactions for', budgetData.month);
      setCurrentMonthTransactions(monthTransactions);
      setShowTransactions(true);
    } catch (err) {
      console.error('[BUDGET] Failed to load transactions:', err);
    }
  };

  const handleCategorize = async (categorization) => {
    const currentTxn = uncategorizedTxns[currentTxnIndex];
    
    if (!currentTxn) {
      console.error('[BUDGET] No current transaction to categorize');
      return;
    }
    
    console.log('[BUDGET] Categorizing transaction:', {
      id: currentTxn.id,
      amount: currentTxn.amount,
      categorization
    });
    
    try {
      await api.put(`/budget/transactions/${currentTxn.id}/categorize`, categorization);
      console.log('[BUDGET] Transaction categorized successfully');
      
      // Refresh categories in case one was auto-created
      try {
        const catsRes = await api.get('/budget/categories');
        setCategories(catsRes.data || []);
      } catch (catsErr) {
        console.error('[BUDGET] Failed to refresh categories:', catsErr);
      }
      
      // Move to next transaction
      if (currentTxnIndex < uncategorizedTxns.length - 1) {
        console.log('[BUDGET] Moving to next transaction');
        setCurrentTxnIndex(currentTxnIndex + 1);
      } else {
        console.log('[BUDGET] All transactions categorized!');
        
        // If budget already exists, reload dashboard with updated data
        if (budget) {
          console.log('[BUDGET] Budget exists, reloading summary...');
          const summaryRes = await api.get('/budget/summary');
          setSummary(summaryRes.data);
          setUncategorizedTxns([]);
          setStep('dashboard');
        } else {
          // First time setup - create budget
          console.log('[BUDGET] Creating budget...');
          await createBudget();
        }
      }
    } catch (err) {
      console.error('[BUDGET] Failed to categorize:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to categorize transaction';
      alert(`Error: ${errorMsg}`);
    }
  };
  const handleRecategorize = async (transactionId, categorization) => {
    try {
      console.log('[BUDGET] Re-categorizing transaction:', transactionId, categorization);
      
      // Auto-create category if it doesn't exist
      if (categorization.category && categorization.bucket !== 'ignore') {
        const categoryExists = categories.some(
          c => c.name.toLowerCase() === categorization.category.toLowerCase() && 
          c.bucket === categorization.bucket
        );
        
        if (!categoryExists) {
          console.log('[BUDGET] Creating new category:', categorization.category);
          await api.post('/budget/categories', {
            name: categorization.category,
            bucket: categorization.bucket
          });
          
          // Reload categories
          const catsRes = await api.get('/budget/categories');
          setCategories(catsRes.data);
        }
      }
      
      await api.put(`/budget/transactions/${transactionId}/categorize`, categorization);
      
      console.log('[BUDGET] Re-categorization successful, refreshing...');
      
      // Reload summary for current budget
      await loadBudgetById(selectedBudgetId);
      
      // Reload transactions list
      await loadCurrentMonthTransactions();
      
    } catch (err) {
      console.error('[BUDGET] Failed to re-categorize:', err);
      alert('Failed to update transaction');
    }
  };
  const createBudget = async () => {
    try {
      console.log('[BUDGET] Creating budget...');
      
      // Determine which month's budget we're creating
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      
      // Budget period: First day of current month to last day of current month
      const periodStart = new Date(currentYear, currentMonth, 1);
      const periodEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59); // Last day of month
      
      console.log('[BUDGET] Period:', periodStart, 'to', periodEnd);
      
      // Calculate total income from last full month (for targets)
      let lastMonth, lastYear;
      if (currentMonth === 0) { // January
        lastMonth = 11; // December
        lastYear = currentYear - 1;
      } else {
        lastMonth = currentMonth - 1;
        lastYear = currentYear;
      }
      
      const lastMonthStart = new Date(lastYear, lastMonth, 1);
      const lastMonthEnd = new Date(lastYear, lastMonth + 1, 0, 23, 59, 59);
      
      console.log('[BUDGET] Calculating income from last month:', lastMonthStart, 'to', lastMonthEnd);
      
      // Get transactions and filter to last full month for income estimate
      const txnsRes = await api.get('/transactions');
      const lastMonthIncome = txnsRes.data
        .filter(t => {
          const txnDate = new Date(t.date);
          return t.user_bucket === 'income' && 
                 parseFloat(t.amount) > 0 &&
                 txnDate >= lastMonthStart && 
                 txnDate <= lastMonthEnd;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      console.log('[BUDGET] Last month income:', lastMonthIncome);
      
      await api.post('/budget/', {
        period_type: 'monthly',
        has_monthly_obligations: false,
        period_start_date: periodStart.toISOString(),
        total_income: lastMonthIncome || 1000, // Use last month's income as estimate
        needs_percentage: 50,
        wants_percentage: 30,
        savings_percentage: 20
      });
      
      console.log('[BUDGET] Budget created successfully');
      
      // Clear period config
      localStorage.removeItem('budgetPeriodConfig');
      
      // Reload to dashboard
      window.location.reload();
    } catch (err) {
      console.error('[BUDGET] Failed to create budget:', err);
      alert('Failed to create budget');
    }
  };

  const loadBudgetById = async (budgetId) => {
    try {
      console.log('[BUDGET] Loading budget:', budgetId);
      
      // Find the budget in history
      const budgetData = budgetHistory.find(b => b.id === budgetId);
      if (!budgetData) {
        console.error('[BUDGET] Budget not found in history');
        return;
      }
      
      console.log('[BUDGET] Selected budget:', budgetData.month);
      
      // Create a budget object from history data
      const budgetObj = {
        id: budgetData.id,
        period_type: 'monthly',
        has_monthly_obligations: false,
        period_start_date: budgetData.period_start,
        next_period_date: budgetData.period_end,
        total_income: budgetData.total_income,
        is_active: budgetData.is_active
      };
      
      setBudget(budgetObj);
      
      // Load summary for this budget
      const summaryRes = await api.get(`/budget/${budgetId}/summary`);
      console.log('[BUDGET] Summary loaded for', budgetData.month);
      
      setSummary(summaryRes.data);
      setSelectedBudgetId(budgetId);
      
      // Check for uncategorized transactions only if viewing current budget
      if (budgetData.is_active) {
        const statusRes = await api.get('/budget/check-setup');
        if (statusRes.data.needs_categorization) {
          const txnsRes = await api.get('/budget/uncategorized-transactions');
          setUncategorizedTxns(txnsRes.data);
        } else {
          setUncategorizedTxns([]);
        }
      } else {
        setUncategorizedTxns([]); // No uncategorized for past months
      }
    } catch (err) {
      console.error('[BUDGET] Failed to load budget:', err);
    }
  };

  const resetEverything = async () => {
    if (!confirm('⚠️ WARNING: This will completely reset your budget setup!\n\nAre you sure?')) {
      return;
    }
    
    try {
      console.log('[BUDGET] Resetting everything...');
      
      const res = await api.post('/budget/reset-all');
      console.log('[BUDGET] Reset response:', res.data);
      
      // Clear localStorage
      localStorage.removeItem('budgetPeriodConfig');
      
      // Reload
      window.location.reload();
    } catch (err) {
      console.error('[BUDGET] Failed to reset:', err);
      alert('Failed to reset. Please try again.');
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

        {step === 'error' && (
          <div style={styles.card}>
            <h1 style={styles.title}>Something Went Wrong</h1>
            <p style={styles.subtitle}>
              Unable to load budget. Please try refreshing the page.
            </p>
            <button onClick={() => window.location.reload()} style={styles.button}>
              Refresh
            </button>
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

        {step === 'categorization' && (
          <>
            {budget && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setStep('dashboard');
                    setCurrentTxnIndex(0);
                  }}
                  style={{
                    ...styles.button,
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '11px',
                    padding: '8px 16px'
                  }}
                >
                  ← Back to Dashboard
                </button>
              </div>
            )}
            
            {periodConfig && currentTxn && (
              <TransactionCategorizer
                transaction={currentTxn}
                categories={categories}
                periodType={periodConfig.periodType}
                hasMonthlyObligations={periodConfig.hasMonthlyObligations}
                onCategorize={handleCategorize}
                onCreateCategory={handleCreateCategory}
                progress={progress}
              />
            )}
          </>
        )}

        {step === 'dashboard' && budget && summary && (
          <>
            {/* Month Navigation */}
            {budgetHistory.length > 0 && (
              <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
                <MonthNavigation
                  budgets={budgetHistory}
                  currentBudgetId={selectedBudgetId}
                  onMonthChange={loadBudgetById}
                />
              </div>
            )}

            {/* Show notification only for current month */}
            {uncategorizedTxns.length > 0 && budgetHistory.find(b => b.id === selectedBudgetId)?.is_active && (
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto 2rem auto',
                padding: '1.5rem',
                background: 'var(--color-accent-light)',
                border: '1px solid var(--color-accent)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  {uncategorizedTxns.length} New Transaction{uncategorizedTxns.length !== 1 ? 's' : ''} to Categorize
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1rem'
                }}>
                  You have new transactions that need to be categorized to track your spending.
                </div>
                <button
                  onClick={() => {
                    const config = {
                      periodType: budget.period_type,
                      hasMonthlyObligations: budget.has_monthly_obligations,
                      periodStartDate: budget.period_start_date
                    };
                    setPeriodConfig(config);
                    
                    api.get('/budget/categories').then(res => {
                      setCategories(res.data);
                      setCurrentTxnIndex(0);
                      setStep('categorization');
                    });
                  }}
                  style={styles.button}
                >
                  Categorize Now
                </button>
              </div>
            )}

            <BudgetDashboard budget={budget} summary={summary} />

            {/* View Transactions Button */}
            <div style={{ maxWidth: '1200px', margin: '2rem auto', textAlign: 'center' }}>
              <button
                onClick={loadCurrentMonthTransactions}
                style={{
                  ...styles.button,
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '12px 24px'
                }}
              >
                View All Transactions
              </button>
            </div>

            {/* Reset button - only show for current month */}
            {budgetHistory.find(b => b.id === selectedBudgetId)?.is_active && (
              <div style={{ maxWidth: '1200px', margin: '2rem auto', textAlign: 'center' }}>
                <button
                  onClick={resetEverything}
                  style={{
                    ...styles.button,
                    background: '#dc3545',
                    fontSize: '12px',
                    padding: '10px 20px'
                  }}
                >
                  Reset Everything
                </button>
              </div>
            )}

            {/* Transactions Modal */}
            {showTransactions && (
              <TransactionsList
                transactions={currentMonthTransactions}
                categories={categories}
                onRecategorize={handleRecategorize}
                onClose={() => setShowTransactions(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Budget;
function MonthNavigation({ budgets, currentBudgetId, onMonthChange }) {
    // Remove duplicates - keep only one budget per month
    const uniqueBudgets = budgets.reduce((acc, budget) => {
      const existing = acc.find(b => b.month === budget.month);
      if (!existing) {
        acc.push(budget);
      } else if (budget.is_active) {
        // Keep the active one
        const index = acc.indexOf(existing);
        acc[index] = budget;
      }
      return acc;
    }, []);
    
    // Generate future months (up to 6 months ahead)
    const now = new Date();
    const allMonths = [...uniqueBudgets];
    
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Check if this month already exists
      const exists = uniqueBudgets.some(b => b.month === monthName);
      
      if (!exists) {
        allMonths.push({
          id: `future-${futureDate.getFullYear()}-${futureDate.getMonth()}`,
          month: monthName,
          period_start: futureDate.toISOString(),
          period_end: new Date(futureDate.getFullYear(), futureDate.getMonth() + 1, 0).toISOString(),
          is_active: false,
          is_future: true,
          total_income: 0
        });
      }
    }
    
    // Sort by date
    allMonths.sort((a, b) => 
      new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
    );
  
    const currentIndex = allMonths.findIndex(b => b.id === currentBudgetId);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allMonths.length - 1;
  
    const styles = {
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      },
      button: {
        padding: '0.5rem 1rem',
        fontSize: '13px',
        fontWeight: '500',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
      },
      monthList: {
        display: 'flex',
        gap: '0.5rem',
        flex: 1,
        overflowX: 'auto',
        padding: '0.5rem 0'
      },
      monthButton: {
        padding: '0.5rem 1rem',
        fontSize: '13px',
        fontWeight: '500',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
      },
      monthButtonActive: {
        background: 'var(--color-accent)',
        color: 'white',
        borderColor: 'var(--color-accent)'
      },
      monthButtonFuture: {
        opacity: 0.6,
        borderStyle: 'dashed'
      }
    };
  
    if (allMonths.length === 0) {
      return null;
    }
  
    return (
      <div style={styles.container}>
        <button
          onClick={() => hasPrevious && onMonthChange(allMonths[currentIndex - 1].id)}
          disabled={!hasPrevious}
          style={{
            ...styles.button,
            ...((!hasPrevious) && styles.buttonDisabled)
          }}
        >
          ← Previous
        </button>
  
        <div style={styles.monthList}>
          {allMonths.map(budget => (
            <button
              key={budget.id}
              onClick={() => {
                if (budget.is_future) {
                  alert(`${budget.month} budget will be available when the month starts. You can start planning ahead soon!`);
                  return;
                }
                console.log('[MONTH NAV] Clicked:', budget.month, 'ID:', budget.id);
                onMonthChange(budget.id);
              }}
              style={{
                ...styles.monthButton,
                ...(budget.id === currentBudgetId && styles.monthButtonActive),
                ...(budget.is_future && styles.monthButtonFuture)
              }}
            >
              {budget.month}
              {budget.is_active && ' ●'}
            </button>
          ))}
        </div>
  
        <button
          onClick={() => {
            if (hasNext) {
              const nextBudget = allMonths[currentIndex + 1];
              if (nextBudget.is_future) {
                alert(`${nextBudget.month} budget will be available when the month starts.`);
                return;
              }
              onMonthChange(nextBudget.id);
            }
          }}
          disabled={!hasNext}
          style={{
            ...styles.button,
            ...((!hasNext) && styles.buttonDisabled)
          }}
        >
          Next →
        </button>
      </div>
    );
  }
  
  export default MonthNavigation;
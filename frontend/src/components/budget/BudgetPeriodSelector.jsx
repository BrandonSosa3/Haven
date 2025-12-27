import { useState } from 'react';

function BudgetPeriodSelector({ onComplete }) {
  const handleSubmit = () => {
    onComplete({
      periodType: 'monthly',
      hasMonthlyObligations: false, // Always false for monthly
      periodStartDate: new Date().toISOString()
    });
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto'
    },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      marginBottom: '0.5rem',
      color: 'var(--color-text-primary)'
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      marginBottom: '3rem'
    },
    card: {
      padding: '2rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      marginBottom: '2rem'
    },
    infoText: {
      fontSize: '14px',
      color: 'var(--color-text-primary)',
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    highlight: {
      fontSize: '13px',
      padding: '1rem',
      background: 'var(--color-accent-light)',
      border: '1px solid var(--color-accent)',
      borderRadius: '6px',
      color: 'var(--color-text-primary)',
      marginBottom: '2rem'
    },
    button: {
      width: '100%',
      padding: '14px',
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Set Up Your Monthly Budget</h1>
      <p style={styles.subtitle}>
        Track your income and expenses month by month
      </p>

      <div style={styles.card}>
        <div style={styles.infoText}>
          Your budget will be based on <strong>last month's income and spending</strong>. 
          Each month, your targets automatically adjust based on the previous month's actuals.
        </div>
        
        <div style={styles.highlight}>
          <strong>How it works:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
            <li>We'll analyze your previous month's transactions</li>
            <li>Set targets for Needs (50%), Wants (30%), Savings (20%)</li>
            <li>Track your spending throughout the current month</li>
            <li>Compare month-to-month to see your progress</li>
          </ul>
        </div>
      </div>

      <button onClick={handleSubmit} style={styles.button}>
        Continue to Categorization
      </button>
    </div>
  );
}

export default BudgetPeriodSelector;
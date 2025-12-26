import { useState } from 'react';

function BudgetPeriodSelector({ onComplete }) {
  const [periodType, setPeriodType] = useState('biweekly');
  const [hasMonthlyObligations, setHasMonthlyObligations] = useState(false);

  const handleSubmit = () => {
    onComplete({
      periodType,
      hasMonthlyObligations,
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
    section: {
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      marginBottom: '1rem',
      fontWeight: '500'
    },
    periodGrid: {
      display: 'grid',
      gap: '1rem',
      marginBottom: '2rem'
    },
    periodOption: {
      padding: '1.5rem',
      border: '2px solid var(--color-border)',
      borderRadius: '8px',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    periodOptionActive: {
      borderColor: 'var(--color-accent)',
      background: 'var(--color-accent-light)'
    },
    periodName: {
      fontSize: '18px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.5rem'
    },
    periodDescription: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1.25rem',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    checkboxActive: {
      borderColor: 'var(--color-accent)',
      background: 'var(--color-accent-light)'
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: 'var(--color-text-primary)',
      cursor: 'pointer',
      flex: 1
    },
    checkboxDescription: {
      fontSize: '12px',
      color: 'var(--color-text-secondary)',
      marginTop: '0.25rem'
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
      cursor: 'pointer',
      marginTop: '2rem'
    }
  };

  const periods = [
    {
      value: 'weekly',
      name: 'Weekly Budget',
      description: 'Track your budget week by week'
    },
    {
      value: 'biweekly',
      name: 'Bi-weekly Budget',
      description: 'Budget resets every 2 weeks'
    },
    {
      value: 'monthly',
      name: 'Monthly Budget',
      description: 'Traditional monthly budget tracking'
    }
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Set Up Your Budget</h1>
      <p style={styles.subtitle}>
        Choose how you want to track your budget.
      </p>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Budget Period</div>
        <div style={styles.periodGrid}>
          {periods.map((period) => (
            <div
              key={period.value}
              onClick={() => setPeriodType(period.value)}
              style={{
                ...styles.periodOption,
                ...(periodType === period.value ? styles.periodOptionActive : {})
              }}
              onMouseEnter={(e) => {
                if (periodType !== period.value) {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (periodType !== period.value) {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }
              }}
            >
              <div style={styles.periodName}>{period.name}</div>
              <div style={styles.periodDescription}>{period.description}</div>
            </div>
          ))}
        </div>
      </div>

      {(periodType === 'weekly' || periodType === 'biweekly') && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Additional Options</div>
          <label
            style={{
              ...styles.checkbox,
              ...(hasMonthlyObligations ? styles.checkboxActive : {})
            }}
          >
            <input
              type="checkbox"
              checked={hasMonthlyObligations}
              onChange={(e) => setHasMonthlyObligations(e.target.checked)}
              style={styles.checkboxInput}
            />
            <div style={styles.checkboxLabel}>
              <div>Track monthly expenses separately</div>
              <div style={styles.checkboxDescription}>
                Keep a separate section for monthly expenses like rent or subscriptions
              </div>
            </div>
          </label>
        </div>
      )}

      <button onClick={handleSubmit} style={styles.button}>
        Continue to Categorization
      </button>
    </div>
  );
}

export default BudgetPeriodSelector;
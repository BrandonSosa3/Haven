function BudgetSummary({ summary, periodConfig, onCreateBudget, onBack }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPeriodLabel = () => {
    if (periodConfig.periodType === 'weekly') return 'Weekly';
    if (periodConfig.periodType === 'biweekly') return 'Bi-weekly';
    return 'Monthly';
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    card: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      marginBottom: '0.5rem',
      color: 'var(--color-text-primary)',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      marginBottom: '2rem',
      textAlign: 'center'
    },
    sectionTitle: {
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      marginBottom: '1rem',
      fontWeight: '500'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: '1px solid var(--color-border)'
    },
    infoLabel: {
      fontSize: '14px',
      color: 'var(--color-text-secondary)'
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--color-text-primary)'
    },
    bucketGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    bucketCard: {
      padding: '1.5rem',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      background: 'var(--color-surface)',
      textAlign: 'center'
    },
    bucketName: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      marginBottom: '0.5rem'
    },
    bucketAmount: {
      fontSize: '24px',
      fontWeight: '300',
      color: 'var(--color-text-primary)',
      marginBottom: '0.25rem'
    },
    bucketCount: {
      fontSize: '12px',
      color: 'var(--color-text-secondary)'
    },
    categoryList: {
      display: 'grid',
      gap: '0.75rem'
    },
    categoryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem',
      border: '1px solid var(--color-border)',
      borderRadius: '6px',
      background: 'var(--color-surface)'
    },
    categoryName: {
      fontSize: '14px',
      color: 'var(--color-text-primary)'
    },
    categoryInfo: {
      fontSize: '12px',
      color: 'var(--color-text-secondary)',
      textAlign: 'right'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    button: {
      flex: 1,
      padding: '14px',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer'
    },
    buttonPrimary: {
      background: 'var(--color-accent)',
      color: 'white'
    },
    buttonSecondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Budget Summary</h1>
        <p style={styles.subtitle}>
          Review your budget setup before we create it
        </p>

        {/* Budget Period Info */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={styles.sectionTitle}>Budget Period</div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Period Type</span>
            <span style={styles.infoValue}>{getPeriodLabel()}</span>
          </div>
          {(periodConfig.periodType === 'weekly' || periodConfig.periodType === 'biweekly') && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Monthly Obligations</span>
              <span style={styles.infoValue}>
                {periodConfig.hasMonthlyObligations ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>

        {/* Totals by Bucket */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={styles.sectionTitle}>Transaction Totals</div>
          <div style={styles.bucketGrid}>
            <div style={styles.bucketCard}>
              <div style={styles.bucketName}>Needs</div>
              <div style={styles.bucketAmount}>{formatCurrency(summary.totals.needs)}</div>
              <div style={styles.bucketCount}>{summary.counts.needs} transactions</div>
            </div>
            <div style={styles.bucketCard}>
              <div style={styles.bucketName}>Wants</div>
              <div style={styles.bucketAmount}>{formatCurrency(summary.totals.wants)}</div>
              <div style={styles.bucketCount}>{summary.counts.wants} transactions</div>
            </div>
            <div style={styles.bucketCard}>
              <div style={styles.bucketName}>Savings</div>
              <div style={styles.bucketAmount}>{formatCurrency(summary.totals.savings)}</div>
              <div style={styles.bucketCount}>{summary.counts.savings} transactions</div>
            </div>
          </div>
          {summary.totals.income > 0 && (
            <div style={{ ...styles.infoRow, borderBottom: 'none', marginTop: '1rem' }}>
              <span style={styles.infoLabel}>Total Income</span>
              <span style={{ ...styles.infoValue, color: 'var(--color-positive)' }}>
                {formatCurrency(summary.totals.income)}
              </span>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        {summary.category_breakdown && summary.category_breakdown.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={styles.sectionTitle}>Category Breakdown</div>
            <div style={styles.categoryList}>
              {summary.category_breakdown.map((cat, idx) => (
                <div key={idx} style={styles.categoryItem}>
                  <div>
                    <div style={styles.categoryName}>{cat.category}</div>
                    <div style={{ ...styles.categoryInfo, textAlign: 'left' }}>
                      {cat.bucket} • {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                    </div>
                  </div>
                  <div style={styles.categoryInfo}>
                    <div style={{ ...styles.categoryName, marginBottom: '0.25rem' }}>
                      {formatCurrency(cat.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={styles.sectionTitle}>Summary</div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Total Transactions Categorized</span>
            <span style={styles.infoValue}>{summary.counts.total}</span>
          </div>
          {summary.counts.ignored > 0 && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Ignored Transactions</span>
              <span style={styles.infoValue}>{summary.counts.ignored}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.buttonGroup}>
          <button onClick={onBack} style={{ ...styles.button, ...styles.buttonSecondary }}>
            Back to Categorization
          </button>
          <button onClick={onCreateBudget} style={{ ...styles.button, ...styles.buttonPrimary }}>
            Create Budget
          </button>
        </div>
      </div>
    </div>
  );
}

export default BudgetSummary;


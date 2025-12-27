function IncomeProgress({ estimatedIncome, actualIncome }) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.abs(amount));
    };
  
    const percentage = estimatedIncome > 0 ? (actualIncome / estimatedIncome) * 100 : 0;
    const isOver = actualIncome > estimatedIncome;
    const difference = Math.abs(actualIncome - estimatedIncome);
  
    const mainColor = 'rgb(0, 153, 153)'; // teal
    const fillColor = 'rgba(0, 153, 153, 0.5)'; // subtle fill
    const overfillColor = 'rgba(0, 153, 153, 0.15)'; // overfill pattern
  
    const styles = {
      container: {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem'
      },
      title: {
        fontSize: '18px',
        fontWeight: '500',
        color: 'var(--color-text-primary)',
        marginBottom: '0.25rem'
      },
      subtitle: {
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      },
      amounts: {
        textAlign: 'right'
      },
      actualAmount: {
        fontSize: '28px',
        fontWeight: '300',
        color: 'var(--color-positive)',
        marginBottom: '0.25rem'
      },
      estimatedAmount: {
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      },
      progressBarContainer: {
        position: 'relative',
        width: '100%',
        height: '16px',
        background: 'var(--color-background)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '0.75rem'
      },
      progressFill: {
        height: '100%',
        background: fillColor,
        transition: 'width 0.3s ease'
      },
      progressOverfill: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          ${overfillColor} 10px,
          ${overfillColor} 20px
        )`
      },
      progressText: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      },
      statusBadge: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        marginTop: '1rem',
        background: 'rgba(0, 153, 153, 0.1)',
        color: mainColor
      }
    };
  
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Income</div>
            <div style={styles.subtitle}>
              Estimated: {formatCurrency(estimatedIncome)} (based on last month)
            </div>
          </div>
          <div style={styles.amounts}>
            <div style={styles.actualAmount}>{formatCurrency(actualIncome)}</div>
            <div style={styles.estimatedAmount}>Actual this month</div>
          </div>
        </div>
  
        <div style={styles.progressBarContainer}>
          <div style={{ ...styles.progressFill, width: `${Math.min(percentage, 100)}%` }} />
          {percentage > 100 && <div style={styles.progressOverfill} />}
        </div>
  
        <div style={styles.progressText}>
          <span>{percentage.toFixed(1)}% of estimated income</span>
          {isOver ? (
            <span style={{ color: 'var(--color-positive)' }}>
              +{formatCurrency(difference)} over estimate
            </span>
          ) : (
            <span>{formatCurrency(difference)} remaining</span>
          )}
        </div>
  
        {percentage >= 100 && (
          <div style={styles.statusBadge}>
            Income goal reached! Exceeded estimate by {formatCurrency(difference)}
          </div>
        )}
      </div>
    );
  }
  
  export default IncomeProgress;
  
  
  
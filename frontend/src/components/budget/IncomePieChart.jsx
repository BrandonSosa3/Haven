function IncomePieChart({ incomeCategories, totalIncome }) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.abs(amount));
    };
  
    // Teal-first, soft, on-theme palette
    const colors = [
      'rgba(0, 153, 153, 0.9)',    // Primary Teal
      'rgba(102, 204, 204, 0.9)',  // Light Teal
      'rgba(163, 220, 180, 0.9)',  // Soft Green
      'rgba(255, 200, 120, 0.9)',  // Soft Orange
      'rgba(255, 215, 140, 0.9)',  // Soft Yellow
      'rgba(120, 200, 190, 0.9)',  // Teal-Green
      'rgba(180, 220, 230, 0.9)',  // Cool Light Blue
      'rgba(140, 190, 190, 0.9)'   // Muted Teal
    ];
  
    if (!incomeCategories || typeof incomeCategories !== 'object') {
      incomeCategories = {};
    }
  
    const validCategories = Object.entries(incomeCategories)
      .filter(([_, amount]) => amount && amount > 0 && !isNaN(amount))
      .map(([name, amount]) => [name, parseFloat(amount)]);
  
    const categories = validCategories.map(([name, amount], index) => {
      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      return {
        name: name || 'Uncategorized',
        amount,
        percentage,
        color: colors[index % colors.length]
      };
    });
  
    let currentAngle = -90;
    const radius = 100;
    const centerX = 120;
    const centerY = 120;
  
    const paths = categories.map(cat => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
  
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
  
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
  
      const largeArc = angle > 180 ? 1 : 0;
  
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  
      currentAngle = endAngle;
  
      return { ...cat, path };
    });
  
    const styles = {
      container: {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      },
      title: {
        fontSize: '18px',
        fontWeight: '500',
        color: 'var(--color-text-primary)',
        marginBottom: '1.5rem'
      },
      content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      },
      chartContainer: {
        display: 'flex',
        justifyContent: 'center'
      },
      legend: {
        display: 'grid',
        gap: '0.75rem',
        width: '100%'
      },
      legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      },
      colorBox: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        flexShrink: 0
      },
      legendContent: {
        flex: 1,
        minWidth: 0
      },
      categoryName: {
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--color-text-primary)',
        marginBottom: '2px'
      },
      categoryStats: {
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      },
      emptyState: {
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-text-secondary)',
        fontSize: '14px'
      }
    };
  
    if (!totalIncome || totalIncome === 0) {
      return (
        <div style={styles.container}>
          <div style={styles.title}>Income Sources</div>
          <div style={styles.emptyState}>No income recorded yet.</div>
        </div>
      );
    }
  
    if (categories.length === 0) {
      return (
        <div style={styles.container}>
          <div style={styles.title}>Income Sources</div>
          <div style={styles.emptyState}>
            No income categories yet. Categorize your income transactions to see the breakdown.
          </div>
        </div>
      );
    }
  
    return (
      <div style={styles.container}>
        <div style={styles.title}>Income Sources</div>
        <div style={styles.content}>
          <div style={styles.chartContainer}>
            <svg width="240" height="240" viewBox="0 0 240 240">
              {paths.map((slice, index) => (
                <path
                  key={index}
                  d={slice.path}
                  fill={slice.color}
                  stroke="var(--color-surface)"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
  
          <div style={styles.legend}>
            {categories.map((cat, index) => (
              <div key={index} style={styles.legendItem}>
                <div
                  style={{
                    ...styles.colorBox,
                    background: cat.color
                  }}
                />
                <div style={styles.legendContent}>
                  <div style={styles.categoryName}>{cat.name}</div>
                  <div style={styles.categoryStats}>
                    {formatCurrency(cat.amount)} • {cat.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  export default IncomePieChart;
  
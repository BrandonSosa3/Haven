import { useState } from 'react';
import IncomeProgress from './IncomeProgress';
import IncomePieChart from './IncomePieChart';

function BudgetDashboard({ budget, summary }) {
  const [expandedBucket, setExpandedBucket] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getProgressColor = (spent, target) => {
    const percentage = (spent / target) * 100;
    const mainColor = 'rgba(0,153,153,0.5)'; // subtle teal
    const amber = '#F59E0B';
    const red = '#DC2626';
    if (percentage < 80) return mainColor;
    if (percentage < 100) return amber;
    return red;
  };

  const getPeriodInfo = () => {
    const start = new Date(budget.period_start_date);
    const end = new Date(budget.next_period_date);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return {
      monthName,
      periodLabel: monthName,
      startDate: formatDate(start),
      endDate: formatDate(end)
    };
  };

  const periodInfo = getPeriodInfo();

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '32px', fontWeight: '300', marginBottom: '0.5rem', color: 'var(--color-text-primary)' },
    subtitle: { fontSize: '14px', color: 'var(--color-text-secondary)' },
    summaryCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' },
    summaryItem: { textAlign: 'center' },
    summaryLabel: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: '500' },
    summaryValue: { fontSize: '28px', fontWeight: '300', color: 'var(--color-text-primary)' },
    bucketCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' },
    bucketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    bucketTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)' },
    bucketAmount: { fontSize: '24px', fontWeight: '300' },
    progressBar: { width: '100%', height: '12px', background: 'var(--color-background)', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.75rem' },
    progressFill: { height: '100%', transition: 'width 0.3s ease', background: 'rgba(0,153,153,0.5)' },
    progressOverfill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,153,153,0.15) 10px, rgba(0,153,153,0.15) 20px)' },
    progressText: { fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' },
    expandIcon: { fontSize: '20px', color: 'var(--color-text-secondary)', transition: 'transform 0.2s' },
    categoriesGrid: { display: 'grid', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' },
    categoryItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-background)', borderRadius: '6px' },
    categoryName: { fontSize: '14px', color: 'var(--color-text-primary)' },
    categoryAmount: { fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)' }
  };

  const totalSpending = summary.spending.total;
  const remaining = summary.income.total - totalSpending;

  const needsTarget = summary.budget.needs_target;
  const wantsTarget = summary.budget.wants_target;
  const savingsTarget = summary.budget.savings_target;

  const needsSpent = summary.spending.needs;
  const wantsSpent = summary.spending.wants;
  const savingsSpent = summary.spending.savings;

  const needsCategories = Object.entries(summary.category_spending).filter(([key]) => key.startsWith('needs_')).map(([key, amount]) => ({ name: key.replace('needs_', ''), amount }));
  const wantsCategories = Object.entries(summary.category_spending).filter(([key]) => key.startsWith('wants_')).map(([key, amount]) => ({ name: key.replace('wants_', ''), amount }));
  const savingsCategories = Object.entries(summary.category_spending).filter(([key]) => key.startsWith('savings_')).map(([key, amount]) => ({ name: key.replace('savings_', ''), amount }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={styles.title}>{periodInfo.monthName}</h1>
            <p style={styles.subtitle}>Monthly Budget</p>
          </div>
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
              Current Period
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {periodInfo.periodLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Income Section with Pie Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Left: Income Progress */}
        <div>
          <IncomeProgress 
            estimatedIncome={summary.budget.total_income}
            actualIncome={summary.income.total}
          />

          {/* Adjusted Targets Notice (if income differs significantly) */}
          {Math.abs(summary.income.total - summary.budget.total_income) > 50 && (
            <div style={{
              background: 'var(--color-accent-light)',
              border: '1px solid var(--color-accent)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                marginBottom: '0.75rem'
              }}>
                💡 Your actual income differs from the estimate
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '1rem'
              }}>
                Based on your actual income of {formatCurrency(summary.income.total)}, your adjusted targets would be:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--color-surface)',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Needs (50%)
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    {formatCurrency(summary.income.total * 0.5)}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                      (was {formatCurrency(needsTarget)})
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Wants (30%)
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    {formatCurrency(summary.income.total * 0.3)}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                      (was {formatCurrency(wantsTarget)})
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Savings (20%)
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    {formatCurrency(summary.income.total * 0.2)}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                      (was {formatCurrency(savingsTarget)})
                    </span>
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-tertiary)',
                marginTop: '1rem',
                fontStyle: 'italic'
              }}>
                The progress bars below still show your original targets. Next month's budget will automatically use this month's actual income.
              </div>
            </div>
          )}
        </div>

        {/* Right: Income Pie Chart */}
        <div>
          <IncomePieChart 
            incomeCategories={summary.income.categories || {}}
            totalIncome={summary.income.total}
          />
        </div>
      </div>

      {/* Spending Summary */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Total Spent</div>
            <div style={styles.summaryValue}>{formatCurrency(totalSpending)}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Remaining Budget</div>
            <div style={{ ...styles.summaryValue, color: remaining >= 0 ? 'var(--color-positive)' : '#DC2626' }}>
              {formatCurrency(remaining)}
            </div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Budget Used</div>
            <div style={styles.summaryValue}>
              {((totalSpending / summary.income.total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Buckets */}
      {['needs', 'wants', 'savings'].map((bucket) => {
        const spent = bucket === 'needs' ? needsSpent : bucket === 'wants' ? wantsSpent : savingsSpent;
        const target = bucket === 'needs' ? needsTarget : bucket === 'wants' ? wantsTarget : savingsTarget;
        const adjusted = bucket === 'needs' ? summary.income.total * 0.5 : bucket === 'wants' ? summary.income.total * 0.3 : summary.income.total * 0.2;
        const categories = bucket === 'needs' ? needsCategories : bucket === 'wants' ? wantsCategories : savingsCategories;
        const bucketLabel = bucket.charAt(0).toUpperCase() + bucket.slice(1);
        const percentage = (spent / target) * 100;

        return (
          <div
            key={bucket}
            style={styles.bucketCard}
            onClick={() => setExpandedBucket(expandedBucket === bucket ? null : bucket)}
          >
            <div style={styles.bucketHeader}>
              <div>
                <div style={styles.bucketTitle}>{bucketLabel} ({bucket === 'needs' ? '50%' : bucket === 'wants' ? '30%' : '20%'})</div>
                <div>
                  <div style={styles.bucketAmount}>
                    {formatCurrency(spent)} of {formatCurrency(target)}
                  </div>
                  {summary.income.total !== summary.budget.total_income && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                      Adjusted: {formatCurrency(adjusted)}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ ...styles.expandIcon, transform: expandedBucket === bucket ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${Math.min(percentage, 100)}%` }} />
              {percentage > 100 && <div style={styles.progressOverfill} />}
            </div>
            <div style={styles.progressText}>
              <span>{percentage.toFixed(1)}% used</span>
              <span>{formatCurrency(target - spent)} remaining</span>
            </div>

            {expandedBucket === bucket && (
              <div style={styles.categoriesGrid}>
                {categories.length > 0 ? categories.map(cat => (
                  <div key={cat.name} style={styles.categoryItem}>
                    <span style={styles.categoryName}>{cat.name}</span>
                    <span style={styles.categoryAmount}>{formatCurrency(cat.amount)}</span>
                  </div>
                )) : (
                  <div style={styles.categoryItem}>
                    <span style={styles.categoryName}>No spending in this category yet</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BudgetDashboard;

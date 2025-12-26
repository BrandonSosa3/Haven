import { useState } from 'react';

function TransactionCategorizer({
  transaction,
  categories,
  periodType,
  hasMonthlyObligations,
  onCategorize,
  onCreateCategory,
  progress
}) {
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoriesForBucket = (bucket) => {
    return categories.filter(c => c.bucket === bucket);
  };

  const handleCreateAndUse = async () => {
    if (!newCategoryName) return;
    
    try {
      await onCreateCategory(selectedBucket, newCategoryName);
      
      // Now submit with the new category name
      handleSubmit(newCategoryName);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category');
    }
  };

  const handleSubmit = (categoryOverride = null) => {
    const category = categoryOverride || selectedCategory;
    
    // Clean up category - convert empty string to null
    const cleanCategory = category && category.trim() ? category.trim() : null;
    
    // Clean up budget_period - convert empty string or falsy to null
    const cleanBudgetPeriod = selectedPeriod && selectedPeriod.trim() ? selectedPeriod.trim() : null;
    
    // Ensure bucket is set
    if (!selectedBucket) {
      alert('Please select a bucket (needs, wants, savings, income, or ignore)');
      return;
    }
    
    onCategorize({
      bucket: selectedBucket,
      category: cleanCategory,
      budget_period: cleanBudgetPeriod
    });
    
    // Reset
    setSelectedBucket(null);
    setSelectedCategory(null);
    setSelectedPeriod(null);
    setShowNewCategory(false);
    setNewCategoryName('');
  };

  const isIncome = transaction.amount > 0;
  
  // Show period selection for ALL needs/wants/savings transactions when:
  // - Budget is weekly/biweekly
  // - Monthly obligations are enabled
  // - Transaction is not income or ignore
  const needsPeriodSelection = 
    !isIncome && 
    selectedBucket && 
    selectedBucket !== 'ignore' && 
    selectedBucket !== 'income' &&
    (periodType === 'weekly' || periodType === 'biweekly') &&
    hasMonthlyObligations;

  // Can submit if:
  // - Bucket is selected
  // - For ignore/income: no other requirements
  // - For needs/wants/savings: category is required, and period is required if needsPeriodSelection is true
  const canSubmit = 
    selectedBucket && 
    (selectedBucket === 'ignore' || 
     selectedBucket === 'income' || 
     (selectedCategory && (!needsPeriodSelection || selectedPeriod)));

  const styles = {
    container: {
      maxWidth: '700px',
      margin: '0 auto'
    },
    progress: {
      marginBottom: '2rem',
      padding: '1.5rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px'
    },
    progressText: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)',
      marginBottom: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: 'var(--color-background)',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'var(--color-accent)',
      transition: 'width 0.3s'
    },
    card: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '2rem'
    },
    txnHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid var(--color-border)'
    },
    merchant: {
      fontSize: '22px',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
      marginBottom: '0.5rem'
    },
    amount: {
      fontSize: '36px',
      fontWeight: '300',
      marginBottom: '0.5rem'
    },
    date: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)'
    },
    section: {
      marginTop: '2rem'
    },
    sectionTitle: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)',
      marginBottom: '1rem',
      fontWeight: '500'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1rem'
    },
    option: {
      padding: '1.25rem',
      border: '2px solid var(--color-border)',
      borderRadius: '8px',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      color: 'var(--color-text-primary)'
    },
    optionActive: {
      borderColor: 'var(--color-accent)',
      background: 'var(--color-accent-light)',
      color: 'var(--color-accent)'
    },
    categoryList: {
      display: 'grid',
      gap: '0.75rem'
    },
    categoryOption: {
      padding: '1rem',
      border: '1px solid var(--color-border)',
      borderRadius: '6px',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid var(--color-border)',
      marginBottom: '0.75rem',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)'
    },
    button: {
      padding: '12px 24px',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '6px',
      border: 'none',
      background: 'var(--color-accent)',
      color: 'white',
      cursor: 'pointer'
    },
    buttonDisabled: {
      background: 'var(--color-border)',
      cursor: 'not-allowed'
    },
    submitButton: {
      width: '100%',
      marginTop: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      {progress && (
        <div style={styles.progress}>
          <div style={styles.progressText}>
            <span>Progress</span>
            <span>
              <strong>{progress.categorized}</strong> of {progress.total}
            </span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${(progress.categorized / progress.total) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.txnHeader}>
          <div style={styles.merchant}>
            {transaction.merchant_name || transaction.description}
          </div>
          <div style={{
            ...styles.amount,
            color: isIncome ? 'var(--color-positive)' : 'var(--color-text-primary)'
          }}>
            {formatCurrency(transaction.amount)}
          </div>
          <div style={styles.date}>{formatDate(transaction.date)}</div>
        </div>

        {/* Step 1: Bucket Selection */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            {isIncome ? 'Is this income?' : 'What type of expense?'}
          </div>
          <div style={styles.grid}>
            {isIncome ? (
              <>
                <div
                  onClick={() => setSelectedBucket('income')}
                  style={{
                    ...styles.option,
                    ...(selectedBucket === 'income' ? styles.optionActive : {})
                  }}
                >
                  Income
                </div>
                <div
                  onClick={() => setSelectedBucket('ignore')}
                  style={{
                    ...styles.option,
                    ...(selectedBucket === 'ignore' ? styles.optionActive : {})
                  }}
                >
                  Ignore
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() => setSelectedBucket('needs')}
                  style={{
                    ...styles.option,
                    ...(selectedBucket === 'needs' ? styles.optionActive : {})
                  }}
                >
                  Needs
                </div>
                <div
                  onClick={() => setSelectedBucket('wants')}
                  style={{
                    ...styles.option,
                    ...(selectedBucket === 'wants' ? styles.optionActive : {})
                  }}
                >
                  Wants
                </div>
                <div
                  onClick={() => setSelectedBucket('savings')}
                  style={{
                    ...styles.option,
                    ...(selectedBucket === 'savings' ? styles.optionActive : {})
                  }}
                >
                  Savings
                </div>
                <div
                  onClick={() => setSelectedBucket('ignore')}
                  style={{
                    ...styles.option,
                    ...(selectedBucket === 'ignore' ? styles.optionActive : {})
                  }}
                >
                  Ignore
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step 2: Category Selection */}
        {selectedBucket && selectedBucket !== 'ignore' && selectedBucket !== 'income' && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Choose or Create Category</div>
            <div style={styles.categoryList}>
              {getCategoriesForBucket(selectedBucket).map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    ...styles.categoryOption,
                    ...(selectedCategory === cat.name ? styles.optionActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.name) {
                      e.target.style.borderColor = 'var(--color-accent)';
                      e.target.style.background = 'var(--color-accent-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.name) {
                      e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.background = 'var(--color-surface)';
                    }
                  }}
                >
                  {cat.name}
                </div>
              ))}

              {!showNewCategory ? (
                <div
                  onClick={() => setShowNewCategory(true)}
                  style={{...styles.categoryOption, borderStyle: 'dashed'}}
                  onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'var(--color-border)'}
                >
                  + Create New Category
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name (e.g., Groceries)"
                    style={styles.input}
                    autoFocus
                  />
                  <button onClick={handleCreateAndUse} style={styles.button}>
                    Create & Use
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Period Selection (if needed) */}
        {needsPeriodSelection && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Which budget period does this belong to?</div>
            <div style={styles.grid}>
              <div
                onClick={() => setSelectedPeriod(periodType === 'weekly' ? 'weekly' : 'biweekly')}
                style={{
                  ...styles.option,
                  ...(selectedPeriod === (periodType === 'weekly' ? 'weekly' : 'biweekly') ? styles.optionActive : {})
                }}
              >
                {periodType === 'weekly' ? 'Weekly' : 'Bi-weekly'} Budget
              </div>
              <div
                onClick={() => setSelectedPeriod('monthly')}
                style={{
                  ...styles.option,
                  ...(selectedPeriod === 'monthly' ? styles.optionActive : {})
                }}
              >
                Monthly Budget
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!canSubmit}
          style={{
            ...styles.button,
            ...styles.submitButton,
            ...(!canSubmit ? styles.buttonDisabled : {})
          }}
        >
          {canSubmit ? 'Categorize & Continue' : 'Complete All Steps'}
        </button>
      </div>
    </div>
  );
}

export default TransactionCategorizer;
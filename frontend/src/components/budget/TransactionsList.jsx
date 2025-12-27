import { useState } from 'react';

function TransactionsList({ transactions, categories, onRecategorize, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
      day: 'numeric'
    });
  };

  const handleSave = async (transaction) => {
    if (!selectedBucket) return;
    
    // Determine final category
    let finalCategory = null;
    if (selectedCategory === '__new__' && newCategoryName) {
      finalCategory = newCategoryName;
    } else if (selectedCategory && selectedCategory !== '__new__') {
      finalCategory = selectedCategory;
    }
    
    await onRecategorize(transaction.id, {
      bucket: selectedBucket,
      category: finalCategory
    });
    
    setEditingId(null);
    setSelectedBucket(null);
    setSelectedCategory(null);
    setNewCategoryName('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedBucket(null);
    setSelectedCategory(null);
    setNewCategoryName('');
  };

  const getCategoriesForBucket = (bucket) => {
    return categories.filter(c => c.bucket === bucket);
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    },
    modal: {
      background: 'var(--color-surface)',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '900px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      padding: '2rem',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      color: 'var(--color-text-primary)'
    },
    closeButton: {
      padding: '0.5rem 1rem',
      fontSize: '13px',
      borderRadius: '6px',
      border: '1px solid var(--color-border)',
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      cursor: 'pointer'
    },
    content: {
      padding: '2rem',
      overflowY: 'auto',
      flex: 1
    },
    transactionsList: {
      display: 'grid',
      gap: '0.75rem'
    },
    transaction: {
      padding: '1rem',
      background: 'var(--color-background)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      display: 'grid',
      gridTemplateColumns: '100px 1fr 150px 120px 100px 40px',
      gap: '1rem',
      alignItems: 'center',
      transition: 'all 0.2s'
    },
    transactionEditing: {
      gridTemplateColumns: '1fr',
      gap: '1rem'
    },
    date: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)'
    },
    merchant: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--color-text-primary)'
    },
    amount: {
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'right'
    },
    bucket: {
      fontSize: '12px',
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      textAlign: 'center',
      textTransform: 'capitalize'
    },
    category: {
      fontSize: '13px',
      color: 'var(--color-text-secondary)'
    },
    editButton: {
      padding: '0.25rem 0.5rem',
      fontSize: '12px',
      borderRadius: '4px',
      border: '1px solid var(--color-border)',
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      cursor: 'pointer'
    },
    editForm: {
      display: 'grid',
      gap: '1rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem'
    },
    select: {
      padding: '0.75rem',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)'
    },
    input: {
      padding: '0.75rem',
      fontSize: '14px',
      borderRadius: '6px',
      border: '2px solid var(--color-accent)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '0.5rem 1rem',
      fontSize: '13px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500'
    },
    saveButton: {
      background: 'var(--color-accent)',
      color: 'white'
    },
    cancelButton: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-secondary)'
    }
  };

  const getBucketColor = (bucket) => {
    const colors = {
      needs: '#3B82F6',
      wants: '#F59E0B',
      savings: '#10B981',
      income: '#8B5CF6',
      ignore: '#6B7280'
    };
    return colors[bucket] || '#6B7280';
  };

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>All Transactions ({transactions.length})</h2>
          <button onClick={onClose} style={styles.closeButton}>Close</button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.transactionsList}>
            {sortedTransactions.map(txn => (
              <div 
                key={txn.id}
                style={{
                  ...styles.transaction,
                  ...(editingId === txn.id && styles.transactionEditing)
                }}
              >
                {editingId === txn.id ? (
                  <div style={styles.editForm}>
                    <div style={styles.formRow}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                          Merchant
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {txn.merchant_name || txn.description}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                          Amount
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {formatCurrency(txn.amount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                          Date
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {formatDate(txn.date)}
                        </div>
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <select
                        value={selectedBucket || ''}
                        onChange={(e) => {
                          setSelectedBucket(e.target.value);
                          setSelectedCategory(null);
                          setNewCategoryName('');
                        }}
                        style={styles.select}
                      >
                        <option value="">Select Bucket</option>
                        {parseFloat(txn.amount) > 0 ? (
                          <>
                            <option value="income">Income</option>
                            <option value="ignore">Ignore</option>
                          </>
                        ) : (
                          <>
                            <option value="needs">Needs</option>
                            <option value="wants">Wants</option>
                            <option value="savings">Savings</option>
                            <option value="ignore">Ignore</option>
                          </>
                        )}
                      </select>

                      {selectedBucket && selectedBucket !== 'ignore' && (
                        <>
                          <select
                            value={selectedCategory || ''}
                            onChange={(e) => {
                              setSelectedCategory(e.target.value);
                              if (e.target.value !== '__new__') {
                                setNewCategoryName('');
                              }
                            }}
                            style={styles.select}
                          >
                            <option value="">Select Category</option>
                            {getCategoriesForBucket(selectedBucket).map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="__new__">+ Create New Category</option>
                          </select>
                          
                          {selectedCategory === '__new__' && (
                            <input
                              type="text"
                              placeholder="Enter category name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              style={styles.input}
                              autoFocus
                            />
                          )}
                        </>
                      )}
                    </div>

                    <div style={styles.buttonGroup}>
                      <button
                        onClick={handleCancel}
                        style={{ ...styles.button, ...styles.cancelButton }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(txn)}
                        disabled={!selectedBucket || (selectedCategory === '__new__' && !newCategoryName)}
                        style={{
                          ...styles.button,
                          ...styles.saveButton,
                          ...((!selectedBucket || (selectedCategory === '__new__' && !newCategoryName)) && { opacity: 0.5, cursor: 'not-allowed' })
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.date}>{formatDate(txn.date)}</div>
                    <div style={styles.merchant}>{txn.merchant_name || txn.description}</div>
                    <div style={{
                      ...styles.amount,
                      color: parseFloat(txn.amount) > 0 ? 'var(--color-positive)' : 'var(--color-text-primary)'
                    }}>
                      {formatCurrency(txn.amount)}
                    </div>
                    <div style={{
                      ...styles.bucket,
                      background: `${getBucketColor(txn.user_bucket)}20`,
                      color: getBucketColor(txn.user_bucket)
                    }}>
                      {txn.user_bucket || 'Uncategorized'}
                    </div>
                    <div style={styles.category}>{txn.user_category || '—'}</div>
                    <button
                      onClick={() => {
                        setEditingId(txn.id);
                        setSelectedBucket(txn.user_bucket);
                        setSelectedCategory(txn.user_category);
                      }}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionsList;
import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import api from '../utils/api';

function PlaidLink({ onSuccess, onExit }) {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    // Get link token from backend
    const createLinkToken = async () => {
      try {
        const response = await api.post('/plaid/create_link_token');
        setLinkToken(response.data.link_token);
      } catch (err) {
        console.error('Failed to create link token:', err);
      }
    };
    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        // Exchange public token for access token
        await api.post('/plaid/exchange_public_token', {
          public_token: publicToken
        });
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error('Failed to exchange token:', err);
      }
    },
    onExit: (err, metadata) => {
      if (onExit) onExit();
    },
  });

  const styles = {
    button: {
      padding: '12px 24px',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '6px',
      border: '1px solid var(--color-accent)',
      background: 'transparent',
      color: 'var(--color-accent)',
      cursor: ready ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s ease',
      opacity: ready ? 1 : 0.5
    }
  };

  return (
    <button
      onClick={() => ready && open()}
      disabled={!ready}
      style={styles.button}
      onMouseEnter={(e) => ready && (e.target.style.background = 'var(--color-accent)', e.target.style.color = 'white')}
      onMouseLeave={(e) => ready && (e.target.style.background = 'transparent', e.target.style.color = 'var(--color-accent)')}
    >
      {ready ? 'Connect Bank Account' : 'Loading...'}
    </button>
  );
}

export default PlaidLink;
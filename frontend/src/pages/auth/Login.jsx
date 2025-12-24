import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      localStorage.setItem('access_token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--color-background)'
    },
    card: {
      width: '100%',
      maxWidth: '450px',
      padding: '3rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    },
    title: {
      fontSize: '48px',
      fontWeight: '300',
      marginBottom: '0.5rem',
      letterSpacing: '0.5px',
      color: 'var(--color-accent)'
    },
    subtitle: {
      fontSize: '14px',
      marginBottom: '3rem',
      color: 'var(--color-text-secondary)'
    },
    label: {
      display: 'block',
      fontSize: '11px',
      textTransform: 'uppercase',
      marginBottom: '0.75rem',
      fontWeight: '500',
      letterSpacing: '0.1em',
      color: 'var(--color-text-secondary)'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '14px',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      transition: 'all 0.2s ease'
    },
    button: {
      width: '100%',
      padding: '14px',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '500',
      borderRadius: '8px',
      border: 'none',
      background: loading ? 'var(--color-border)' : 'var(--color-accent)',
      color: 'white',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease'
    },
    error: {
      padding: '12px 16px',
      marginBottom: '1.5rem',
      borderRadius: '8px',
      fontSize: '13px',
      background: '#FEE2E2',
      color: '#991B1B'
    },
    footer: {
      marginTop: '2rem',
      textAlign: 'center',
      fontSize: '13px',
      color: 'var(--color-text-tertiary)'
    },
    link: {
      color: 'var(--color-accent)',
      fontWeight: '500',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>HAVEN</h1>
        <p style={styles.subtitle}>Your financial sanctuary</p>
        
        <form onSubmit={handleLogin}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--color-accent)')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <a href="/register" style={styles.link}>Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
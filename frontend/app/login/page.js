'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.auth.login(form);
      login({ id: res.id, name: res.name, email: res.email, role: res.role }, res.token);
      toast.success(`Welcome back, ${res.name}!`);
      router.push(res.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      {/* Left — Form */}
      <div className={styles.formSide}>
        <div className={styles.formInner}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>
          <div className={styles.formHead}>
            <span className={styles.logoMark}><span style={{color:'var(--color-accent)'}}>●</span> Found</span>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.sub}>Sign in to your campus account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label className="input-label">Email address</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="you@student.edu"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account? <Link href="/register">Create one →</Link>
          </p>
        </div>
      </div>

      {/* Right — Image */}
      <div className={styles.imageSide}>
        <Image src="/auth_campus.png" alt="Campus library" fill style={{ objectFit: 'cover' }} priority />
        <div className={styles.imageOverlay} />
        <div className={styles.imageCopy}>
          <p className={styles.imageQuote}>"Every item recovered is one less replacement purchase."</p>
        </div>
      </div>
    </div>
  );
}

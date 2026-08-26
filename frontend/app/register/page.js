'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name)     e.name     = 'Full name is required';
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required (min 6 chars)';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.auth.register(form);
      login({ id: res.id, name: res.name, email: res.email, role: res.role }, res.token);
      toast.success(`Account created! Welcome, ${res.name}.`);
      const targetRole = String(res.role).toUpperCase();
      router.push((targetRole === 'ADMIN' || targetRole === 'ROLE_ADMIN') ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
            <h1 className={styles.title}>Create account</h1>
            <p className={styles.sub}>Join your campus lost & found network</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Amaka Okafor"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div>
              <label className="input-label">Campus Email</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="amaka@student.edu"
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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div>
              <label className="input-label">Account Role</label>
              <select
                className="input-field"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="STUDENT">Student / Staff</option>
                <option value="ADMIN">Administrator (Lost & Found Office / Security)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link href="/login">Sign in →</Link>
          </p>
        </div>
      </div>

      {/* Right — Image */}
      <div className={styles.imageSide}>
        <Image src="/auth_campus.png" alt="Campus library" fill style={{ objectFit: 'cover' }} priority />
        <div className={styles.imageOverlay} />
        <div className={styles.imageCopy}>
          <p className={styles.imageQuote}>"Connecting the person who lost something with the security post holding it."</p>
        </div>
      </div>
    </div>
  );
}

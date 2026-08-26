'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import styles from './page.module.css';

export default function CreateReportPage() {
  return (
    <Suspense fallback={<div className="page-body container"><div className="spinner spinner-lg" /></div>}>
      <CreateReportForm />
    </Suspense>
  );
}

function CreateReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState(null);

  const initialType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';

  const [form, setForm] = useState({
    type: initialType,
    categoryId: '',
    description: '',
    location: '',
    holdingLocation: '',
    dateOccurred: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  if (authLoading) return <div className="page-body container"><div className="spinner spinner-lg" /></div>;

  if (!user) {
    return (
      <div className="page-body container">
        <div className="card-flat empty-state">
          <Image src="/empty_state.png" alt="Login required" width={160} height={160} />
          <h3>Sign in required</h3>
          <p>Please log in to your account to file a lost or found report.</p>
          <Link href="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const validateStep2 = () => {
    const e = {};
    if (!form.categoryId)  e.categoryId  = 'Please select a category';
    if (!form.description) e.description = 'Please enter a description';
    if (!form.location)    e.location    = 'Please specify where it was lost/found';
    if (!form.dateOccurred)e.dateOccurred= 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      const res = await api.reports.create({
        ...form,
        categoryId: Number(form.categoryId),
      });
      setCreatedReport(res);
      setStep(3); // Success step
      toast.success(`${form.type === 'LOST' ? 'Lost' : 'Found'} report created successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <div className="container" style={{ maxWidth: '640px' }}>
        <Link href="/reports" className={styles.backLink}>← Back to reports</Link>

        {/* Progress header */}
        <div className={styles.progressHeader}>
          <h1 className={styles.title}>
            {step === 3 ? 'Report Submitted!' : `Report a ${form.type === 'LOST' ? 'Lost' : 'Found'} Item`}
          </h1>
          {step < 3 && (
            <div className={styles.stepIndicator}>
              Step {step} of 2 — {step === 1 ? 'Select Report Type' : 'Item Details'}
            </div>
          )}
        </div>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div className={`card ${styles.stepCard} animate-fade-up`}>
            <p className={styles.label}>What are you reporting?</p>

            <div className={styles.typeOptions}>
              <div
                className={`${styles.typeOption} ${form.type === 'LOST' ? styles.selectedLost : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'LOST' }))}
              >
                <span className={styles.typeEmoji}>🔍</span>
                <div>
                  <h3>I Lost Something</h3>
                  <p>Create a report so others who find it can match and notify you.</p>
                </div>
              </div>

              <div
                className={`${styles.typeOption} ${form.type === 'FOUND' ? styles.selectedFound : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'FOUND' }))}
              >
                <span className={styles.typeEmoji}>🎒</span>
                <div>
                  <h3>I Found Something</h3>
                  <p>Log a found item so its owner can search and submit a claim.</p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={() => setStep(2)} className="btn btn-primary btn-full btn-lg">
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <div className={`card ${styles.stepCard} animate-fade-up`}>
            <div className={styles.formGrid}>
              {/* Category */}
              <div>
                <label className="input-label">Category</label>
                <select
                  className={`input-field ${errors.categoryId ? 'input-error' : ''}`}
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="error-text">{errors.categoryId}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="input-label">Description & Distinguishing Features</label>
                <textarea
                  rows={4}
                  className={`input-field ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe the item (color, brand, scratches, wallpaper, contents)..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
                {errors.description && <p className="error-text">{errors.description}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="input-label">
                  {form.type === 'LOST' ? 'Last Known Location' : 'Where it was Found'}
                </label>
                <input
                  type="text"
                  className={`input-field ${errors.location ? 'input-error' : ''}`}
                  placeholder="e.g., Campus shuttle, Main Gate to Science Faculty route"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
                {errors.location && <p className="error-text">{errors.location}</p>}
              </div>

              {/* Holding Location (FOUND only) */}
              {form.type === 'FOUND' && (
                <div>
                  <label className="input-label">Current Holding Location</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Main Gate security post, Dean's Office"
                    value={form.holdingLocation}
                    onChange={e => setForm(f => ({ ...f, holdingLocation: e.target.value }))}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    Where the owner can collect the item after claim confirmation.
                  </span>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="input-label">Date</label>
                <input
                  type="date"
                  className={`input-field ${errors.dateOccurred ? 'input-error' : ''}`}
                  value={form.dateOccurred}
                  onChange={e => setForm(f => ({ ...f, dateOccurred: e.target.value }))}
                />
                {errors.dateOccurred && <p className="error-text">{errors.dateOccurred}</p>}
              </div>
            </div>

            <div className={styles.btnRow}>
              <button onClick={() => setStep(1)} className="btn btn-ghost">← Back</button>
              <button onClick={handleSubmit} className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Submit Report'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen (No confetti) */}
        {step === 3 && createdReport && (
          <div className={`card ${styles.successCard} animate-scale-in`}>
            <div className={styles.successIcon}>✓</div>
            <h2>Report Created Successfully</h2>
            <p>Your {form.type.toLowerCase()} report has been published and is searchable across campus.</p>

            <div className={styles.summaryBox}>
              <div><strong>Category:</strong> {createdReport.categoryName}</div>
              <div><strong>Description:</strong> {createdReport.description}</div>
              <div><strong>Location:</strong> {createdReport.location}</div>
            </div>

            <div className={styles.successActions}>
              <Link href={`/reports/${createdReport.id}`} className="btn btn-primary btn-full">
                View Report & Check Matches →
              </Link>
              <Link href="/reports" className="btn btn-secondary btn-full">
                Browse All Reports
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

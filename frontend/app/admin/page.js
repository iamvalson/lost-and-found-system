'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import styles from './page.module.css';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        api.dashboard.stats(),
        api.claims.adminList()
      ]);
      setStats(s);
      setPendingClaims(c || []);
    } catch (err) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin, loadAdminData]);

  const handleConfirm = async (claimId) => {
    setActioningId(claimId);
    try {
      await api.claims.confirm(claimId);
      toast.success('Claim CONFIRMED! Case marked as RESOLVED.');
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm claim');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (claimId) => {
    setActioningId(claimId);
    try {
      await api.claims.reject(claimId);
      toast.info('Claim rejected');
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject claim');
    } finally {
      setActioningId(null);
    }
  };

  if (authLoading || loading) {
    return <div className="page-body container"><div className="spinner spinner-lg" /></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="page-body container">
        <div className="card-flat empty-state">
          <Image src="/empty_state.png" alt="Access denied" width={160} height={160} />
          <h3>Access Denied</h3>
          <p>Administrator permissions (ADMIN role) are required to access this dashboard.</p>
          <Link href="/" className="btn btn-secondary">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.adminPill}>ADMINISTRATOR DASHBOARD</span>
            <h1 className={styles.title}>Lost & Found Office Portal</h1>
            <p className={styles.sub}>Review claims, verify ownership, and track campus recovery metrics</p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={`card ${styles.statCard}`}>
              <span className={styles.statVal}>{stats.openLostReports}</span>
              <span className={styles.statLabel}>Open Lost Reports</span>
            </div>

            <div className={`card ${styles.statCard}`}>
              <span className={styles.statVal} style={{ color: 'var(--color-found)' }}>{stats.openFoundReports}</span>
              <span className={styles.statLabel}>Open Found Items</span>
            </div>

            <div className={`card ${styles.statCard}`}>
              <span className={styles.statVal} style={{ color: 'var(--color-resolved)' }}>{stats.resolvedCases}</span>
              <span className={styles.statLabel}>Resolved Cases</span>
            </div>

            <div className={`card ${styles.statCard}`}>
              <span className={styles.statVal} style={{ color: 'var(--color-pending)' }}>{stats.pendingClaims}</span>
              <span className={styles.statLabel}>Pending Claims</span>
            </div>
          </div>
        )}

        {/* Pending Claims Section */}
        <div className={styles.sectionHead}>
          <h2>Pending Claims Review ({pendingClaims.length})</h2>
          <p>Verify details submitted by claimants against holding items before confirming handover.</p>
        </div>

        {pendingClaims.length > 0 ? (
          <div className={styles.claimsGrid}>
            {pendingClaims.map(c => (
              <div key={c.id} className={`card ${styles.claimReviewCard}`}>
                <div className={styles.claimReviewHead}>
                  <div>
                    <span className="badge badge-pending">Pending Review</span>
                    <h3 style={{ marginTop: '6px' }}>Claim #{c.id} for Found Item #{c.itemReportId}</h3>
                  </div>
                  <span className={styles.claimDate}>{formatDate(c.createdAt)}</span>
                </div>

                <div className={styles.claimReviewBody}>
                  {/* Found Item Info */}
                  <div className={styles.infoBlock}>
                    <span className={styles.blockLabel}>ITEM HELD:</span>
                    <div className={styles.blockTitle}>{c.itemReport.categoryName}</div>
                    <p>{c.itemReport.description}</p>
                    <div className={styles.metaRow}>
                      <span>📍 Found at: {c.itemReport.location}</span>
                      {c.itemReport.holdingLocation && <span>🏢 Kept at: {c.itemReport.holdingLocation}</span>}
                    </div>
                  </div>

                  {/* Claimant Info & Note */}
                  <div className={`${styles.infoBlock} ${styles.claimantBlock}`}>
                    <span className={styles.blockLabel}>CLAIMANT:</span>
                    <div className={styles.blockTitle}>{c.claimedByName} ({c.claimedByEmail})</div>
                    <div className={styles.noteContent}>
                      <strong>Note / Proof:</strong> "{c.note}"
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.claimActions}>
                  <button
                    onClick={() => handleReject(c.id)}
                    className="btn btn-danger btn-sm"
                    disabled={actioningId === c.id}
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleConfirm(c.id)}
                    className="btn btn-success btn-sm"
                    disabled={actioningId === c.id}
                  >
                    {actioningId === c.id ? <span className="spinner" /> : '✓ Confirm & Resolve Case'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-flat empty-state">
            <Image src="/empty_state.png" alt="No pending claims" width={140} height={140} />
            <h3>No pending claims</h3>
            <p>All submitted claims have been reviewed and processed.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

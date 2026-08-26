'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReportCard from '@/components/ReportCard/ReportCard';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import styles from './page.module.css';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  const toast = useToast();

  const [report, setReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claim Form state
  const [claimNote, setClaimNote] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rep = await api.reports.get(id);
      setReport(rep);

      // Fetch matches
      const m = await api.reports.matches(id);
      setMatches(m || []);
    } catch (err) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) loadData();
  }, [id, loadData]);

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimNote.trim()) {
      toast.error('Please enter a note describing why this item is yours');
      return;
    }
    setClaiming(true);
    try {
      await api.claims.submit({ itemReportId: Number(id), note: claimNote });
      setClaimSuccess(true);
      toast.success('Claim submitted! An administrator will review your claim.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="page-body container"><div className="spinner spinner-lg" /></div>;

  if (!report) {
    return (
      <div className="page-body container">
        <div className="card-flat empty-state">
          <h3>Report not found</h3>
          <Link href="/reports" className="btn btn-secondary">Back to reports</Link>
        </div>
      </div>
    );
  }

  const isFound = report.type === 'FOUND';
  const isResolved = report.status === 'RESOLVED';

  return (
    <div className="page-body">
      <div className="container">
        <Link href="/reports" className={styles.backLink}>← Back to reports</Link>

        <div className={styles.layout}>
          {/* Left Column: Report Details */}
          <div className={styles.mainCol}>
            <div className={`card ${styles.detailCard}`}>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.badges}>
                  <span className={`badge ${isFound ? 'badge-found' : 'badge-lost'}`}>{report.type}</span>
                  <span className={`badge ${isResolved ? 'badge-resolved' : 'badge-open'}`}>{report.status}</span>
                  <span className={styles.categoryPill}>{report.categoryName}</span>
                </div>
                <span className={styles.date}>Reported on {formatDate(report.createdAt)}</span>
              </div>

              {/* Title & Description */}
              <h1 className={styles.description}>{report.description}</h1>

              {/* Key Details Meta */}
              <div className={styles.metaBox}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>📍 Location:</span>
                  <span className={styles.metaVal}>{report.location}</span>
                </div>

                {isFound && report.holdingLocation && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>🏢 Currently Held At:</span>
                    <span className={styles.metaVal}>{report.holdingLocation}</span>
                  </div>
                )}

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>📅 Date Occurred:</span>
                  <span className={styles.metaVal}>{formatDate(report.dateOccurred)}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>👤 Reported By:</span>
                  <span className={styles.metaVal}>{report.reportedByName} ({report.reportedByEmail})</span>
                </div>
              </div>
            </div>

            {/* Claim Section for FOUND items */}
            {isFound && !isResolved && (
              <div className={`card ${styles.claimCard}`}>
                <h2>Is this your item? Submit a Claim</h2>
                <p className={styles.claimSub}>
                  Provide distinguishing details (e.g., wallpapers, scratches, exact serials) so an administrator can verify ownership.
                </p>

                {claimSuccess ? (
                  <div className={styles.claimSuccessBox}>
                    <span style={{ fontSize: '1.4rem' }}>✅</span>
                    <div>
                      <strong>Claim Pending Review</strong>
                      <p>Your claim has been recorded. Please visit the holding location with your ID for physical verification.</p>
                    </div>
                  </div>
                ) : user ? (
                  <form onSubmit={handleSubmitClaim} className={styles.claimForm}>
                    <textarea
                      rows={3}
                      className="input-field"
                      placeholder="Describe distinguishing marks, lock screen wallpaper, or bag contents..."
                      value={claimNote}
                      onChange={e => setClaimNote(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={claiming}>
                      {claiming ? <span className="spinner" /> : 'Submit Claim'}
                    </button>
                  </form>
                ) : (
                  <div className={styles.loginPrompt}>
                    <p>You must be signed in to submit a claim for this item.</p>
                    <Link href="/login" className="btn btn-primary btn-sm">Sign In to Claim</Link>
                  </div>
                )}
              </div>
            )}

            {/* Resolved notice */}
            {isResolved && (
              <div className={styles.resolvedNotice}>
                ℹ️ This case has been confirmed and resolved by campus administration.
              </div>
            )}
          </div>

          {/* Right Column: Suggested Matches */}
          <div className={styles.sideCol}>
            <div className={styles.sideHeader}>
              <h3>Automatic System Matches</h3>
              <p>Reports of opposite type with matching category, location, or keywords.</p>
            </div>

            {matches.length > 0 ? (
              <div className={styles.matchesList}>
                {matches.map(m => (
                  <div key={m.report.id} className={`card ${styles.matchItem}`}>
                    <div className={styles.matchScoreBar}>
                      <span className={styles.matchScoreBadge}>
                        {m.matchScore} / 4 Match Confidence
                      </span>
                    </div>

                    {/* Match Reasons */}
                    <ul className={styles.reasonsList}>
                      {m.matchReasons.map((r, idx) => (
                        <li key={idx}>✓ {r}</li>
                      ))}
                    </ul>

                    {/* Report Preview */}
                    <div className={styles.matchReportPreview}>
                      <ReportCard report={m.report} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-flat empty-state" style={{ padding: '32px 16px' }}>
                <p>No automatic matches detected yet. We'll surface matches when a complementary report is created.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

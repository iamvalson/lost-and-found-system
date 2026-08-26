'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReportCard from '@/components/ReportCard/ReportCard';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import styles from './page.module.css';

export default function MyActivityPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'claims'
  const [myReports, setMyReports] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([api.reports.mine(), api.claims.mine()])
        .then(([reps, clms]) => {
          setMyReports(reps || []);
          setMyClaims(clms || []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="page-body container"><div className="spinner spinner-lg" /></div>;
  }

  if (!user) {
    return (
      <div className="page-body container">
        <div className="card-flat empty-state">
          <Image src="/empty_state.png" alt="Login required" width={160} height={160} />
          <h3>Sign in required</h3>
          <p>Please log in to view your filed reports and active claims.</p>
          <Link href="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Activity</h1>
            <p className={styles.sub}>Track all reports filed by you and claims you've submitted</p>
          </div>
          <Link href="/reports/new" className="btn btn-primary">+ File New Report</Link>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: '320px', marginBottom: '28px' }}>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            My Reports ({myReports.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
            onClick={() => setActiveTab('claims')}
          >
            My Claims ({myClaims.length})
          </button>
        </div>

        {/* Tab 1: My Reports */}
        {activeTab === 'reports' && (
          myReports.length > 0 ? (
            <div className={styles.grid}>
              {myReports.map(r => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          ) : (
            <div className="card-flat empty-state">
              <Image src="/empty_state.png" alt="No reports" width={140} height={140} />
              <h3>No reports filed yet</h3>
              <p>When you report a lost or found item, it will appear here for tracking.</p>
              <Link href="/reports/new" className="btn btn-primary btn-sm">Report an Item</Link>
            </div>
          )
        )}

        {/* Tab 2: My Claims */}
        {activeTab === 'claims' && (
          myClaims.length > 0 ? (
            <div className={styles.claimsList}>
              {myClaims.map(c => (
                <div key={c.id} className={`card ${styles.claimItem}`}>
                  <div className={styles.claimHead}>
                    <span className={`badge ${
                      c.status === 'CONFIRMED' ? 'badge-found' :
                      c.status === 'REJECTED'  ? 'badge-lost'  : 'badge-pending'
                    }`}>
                      {c.status}
                    </span>
                    <span className={styles.date}>Submitted on {formatDate(c.createdAt)}</span>
                  </div>

                  <div className={styles.claimBody}>
                    <h4>Claimed Item: {c.itemReport.categoryName}</h4>
                    <p className={styles.itemDesc}>{c.itemReport.description}</p>
                    <div className={styles.noteBox}>
                      <strong>Your Claim Note:</strong> "{c.note}"
                    </div>

                    {c.itemReport.holdingLocation && (
                      <div className={styles.holdingInfo}>
                        📍 Collection Point: <strong>{c.itemReport.holdingLocation}</strong>
                      </div>
                    )}
                  </div>

                  <div className={styles.claimFoot}>
                    <Link href={`/reports/${c.itemReportId}`} className="btn btn-ghost btn-sm">View Item Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-flat empty-state">
              <Image src="/empty_state.png" alt="No claims" width={140} height={140} />
              <h3>No claims submitted</h3>
              <p>Browse found items and submit a claim if you spot your lost belonging.</p>
              <Link href="/reports?type=FOUND" className="btn btn-primary btn-sm">Browse Found Items</Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

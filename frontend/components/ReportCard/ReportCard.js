import styles from './ReportCard.module.css';
import Link from 'next/link';

const CATEGORY_EMOJI = {
  'accessories':           '👓',
  'id cards & documents':  '🪪',
  'phones & tablets':      '📱',
  'laptops & electronics': '💻',
  'bags & backpacks':      '🎒',
  'textbooks & notebooks': '📚',
  'keys':                  '🗝️',
  'clothing':              '👕',
  'other':                 '📦',
};

function getCategoryEmoji(name) {
  return CATEGORY_EMOJI[name?.toLowerCase()] || '📦';
}

export default function ReportCard({ report }) {
  const isFound = report.type === 'FOUND';
  const isResolved = report.status === 'RESOLVED';

  return (
    <Link href={`/reports/${report.id}`} className={`card ${styles.card}`}>
      {/* Colour stripe */}
      <div className={`${styles.stripe} ${isFound ? styles.stripeFound : styles.stripeLost}`} />

      <div className={styles.body}>
        {/* Header row */}
        <div className={styles.header}>
          <span className={styles.emoji}>{getCategoryEmoji(report.categoryName)}</span>
          <div className={styles.badges}>
            <span className={`badge ${isFound ? 'badge-found' : 'badge-lost'}`}>{report.type}</span>
            {isResolved && <span className="badge badge-resolved">Resolved</span>}
          </div>
        </div>

        {/* Category */}
        <span className={styles.category}>{report.categoryName}</span>

        {/* Description */}
        <p className={styles.description}>{report.description}</p>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <PinIcon />
              {report.location}
            </span>
            <span className={styles.metaItem}>
              <CalIcon />
              {formatDate(report.dateOccurred)}
            </span>
          </div>
          {report.type === 'FOUND' && report.holdingLocation && (
            <span className={styles.holding}>
              📍 Held at: {report.holdingLocation}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PinIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function CalIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

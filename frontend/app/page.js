'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReportCard from '@/components/ReportCard/ReportCard';
import { api } from '@/lib/api';
import styles from './page.module.css';

const HOW_IT_WORKS = [
  { step: '01', title: 'Report it', desc: 'File a lost or found report with a description, category, and location. Takes under a minute.', icon: '📝' },
  { step: '02', title: 'Smart matching', desc: 'The system automatically scans existing reports and surfaces likely matches based on keywords, location, and date.', icon: '🔍' },
  { step: '03', title: 'Claim & collect', desc: 'Submit a claim with your identifying details. An admin verifies and confirms. Case closed.', icon: '✅' },
];

const SDG_TAGS = [
  { code: 'SDG 9',  label: 'Innovation & Infrastructure', color: '#E5793B' },
  { code: 'SDG 11', label: 'Sustainable Communities',     color: '#F99D25' },
  { code: 'SDG 12', label: 'Responsible Consumption',     color: '#BF8B2E' },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.reports.search({ type: 'FOUND' }).then(r => setRecent(r?.slice(0, 6) || [])).catch(() => {});
  }, []);

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <Image src="/hero_campus.png" alt="Campus" fill style={{ objectFit: 'cover' }} priority />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent} animate-fade-up`}>
          <div className={styles.heroPill}>COS202 Project — Group 19</div>
          <h1 className={styles.heroTitle}>
            Lost something?<br /><em>We can help you find it.</em>
          </h1>
          <p className={styles.heroSub}>
            A smarter way to reconnect students and staff with lost belongings across campus.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/reports/new?type=LOST" className="btn btn-primary btn-lg">Report a Lost Item</Link>
            <Link href="/reports/new?type=FOUND" className={`btn btn-lg ${styles.btnFoundHero}`}>I Found Something</Link>
          </div>
          <Link href="/reports" className={styles.browseLink}>
            Or browse all reports →
          </Link>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className={`section ${styles.howSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>How it works</h2>
            <p>Three steps. No WhatsApp groups. No guessing.</p>
          </div>
          <div className={`${styles.stepsGrid} stagger`}>
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className={`card ${styles.stepCard} animate-fade-up`}>
                <span className={styles.stepEmoji}>{s.icon}</span>
                <span className={styles.stepNum}>{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Found Items ────────────────────────────────── */}
      {recent.length > 0 && (
        <section className={`section ${styles.recentSection}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2>Recently found on campus</h2>
              <p>These items are waiting to be claimed. Is one of them yours?</p>
            </div>
            <div className={styles.cardsGrid}>
              {recent.map((r, i) => (
                <div key={r.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <ReportCard report={r} />
                </div>
              ))}
            </div>
            <div className={styles.viewAll}>
              <Link href="/reports?type=FOUND" className="btn btn-secondary">View all found items</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Campus image break ────────────────────────────────── */}
      <section className={styles.imageBreak}>
        <div className={styles.imageBreakInner}>
          <Image src="/campus_shuttle.png" alt="Campus shuttle" fill style={{ objectFit: 'cover' }} />
          <div className={styles.imageBreakOverlay} />
          <div className={`container ${styles.imageBreakContent}`}>
            <blockquote className={styles.quote}>
              "Without the system, this is how the original incident ended — unresolved, because there was no shared channel."
            </blockquote>
            <cite className={styles.quoteAttrib}>— Project Document, Section 4</cite>
          </div>
        </div>
      </section>

      {/* ── SDG Alignment ────────────────────────────────────── */}
      <section className={`section-sm ${styles.sdgSection}`}>
        <div className="container">
          <p className={styles.sdgLabel}>This project supports</p>
          <div className={styles.sdgRow}>
            {SDG_TAGS.map(s => (
              <div key={s.code} className={styles.sdgTag} style={{ borderColor: s.color, color: s.color }}>
                <span className={styles.sdgCode}>{s.code}</span>
                <span className={styles.sdgText}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────── */}
      <section className={styles.ctaStrip}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2>Ready to get started?</h2>
              <p>Create your account in seconds. No ID required — just your campus email.</p>
            </div>
            <div className={styles.ctaBtns}>
              <Link href="/register" className="btn btn-primary btn-lg">Create Account</Link>
              <Link href="/login"    className="btn btn-secondary btn-lg">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <span className={styles.footerLogo}><span style={{color:'var(--color-accent)'}}>●</span> Found</span>
            <span className={styles.footerText}>Group 19 · COS202 · 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

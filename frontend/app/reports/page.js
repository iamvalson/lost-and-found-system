'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ReportCard from '@/components/ReportCard/ReportCard';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function BrowseReportsPage() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState(''); // '', 'LOST', 'FOUND'
  const [catFilter, setCatFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  // Fetch categories once
  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  // Fetch reports on filter change
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.reports.search({
        type: typeFilter || undefined,
        categoryId: catFilter || undefined,
        keyword: keyword || undefined,
        location: location || undefined,
      });
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, catFilter, keyword, location]);

  useEffect(() => {
    const timer = setTimeout(fetchReports, 250);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  return (
    <div className="page-body">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Browse Campus Reports</h1>
            <p className={styles.sub}>Search lost and found records across all categories and locations</p>
          </div>

          {/* Type Filter Buttons */}
          <div className={styles.typeSelector}>
            <button
              className={`${styles.typeBtn} ${typeFilter === '' ? styles.activeType : ''}`}
              onClick={() => setTypeFilter('')}
            >
              All Reports
            </button>
            <button
              className={`${styles.typeBtn} ${typeFilter === 'LOST' ? styles.activeLost : ''}`}
              onClick={() => setTypeFilter('LOST')}
            >
              Lost Items
            </button>
            <button
              className={`${styles.typeBtn} ${typeFilter === 'FOUND' ? styles.activeFound : ''}`}
              onClick={() => setTypeFilter('FOUND')}
            >
              Found Items
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className={`card-flat ${styles.filterBar}`}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by keyword (e.g., glasses, black bag, shuttle)..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            {keyword && <button onClick={() => setKeyword('')} className={styles.clearBtn}>×</button>}
          </div>

          <div className={styles.selectRow}>
            {/* Category Dropdown */}
            <select
              className={styles.select}
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Location Input */}
            <div className={styles.locationBox}>
              <PinIcon />
              <input
                type="text"
                placeholder="Location (e.g. Main Gate)"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              {location && <button onClick={() => setLocation('')} className={styles.clearBtn}>×</button>}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsMeta}>
          <span>{loading ? 'Searching...' : `Showing ${reports.length} report${reports.length === 1 ? '' : 's'}`}</span>
        </div>

        {/* Grid or Loading/Empty State */}
        {loading ? (
          <div className={styles.loaderArea}>
            <div className="spinner spinner-lg" />
          </div>
        ) : reports.length > 0 ? (
          <div className={styles.grid}>
            {reports.map((r, i) => (
              <div key={r.id} className="animate-fade-up" style={{ animationDelay: `${(i % 6) * 40}ms` }}>
                <ReportCard report={r} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-flat empty-state">
            <Image src="/empty_state.png" alt="No reports found" width={160} height={160} />
            <h3>No matching reports found</h3>
            <p>Try tweaking your keyword, selecting a different category, or resetting your search filters.</p>
            <button
              onClick={() => { setKeyword(''); setCatFilter(''); setLocation(''); setTypeFilter(''); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function PinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}

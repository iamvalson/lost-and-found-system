'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <HomeIcon /><span>Home</span>
        </Link>
        <Link href="/reports" className={`mobile-nav-item ${pathname.startsWith('/reports') ? 'active' : ''}`}>
          <SearchIcon /><span>Browse</span>
        </Link>
        <Link href="/reports/new" className={`mobile-nav-item ${styles.centerBtn}`}>
          <div className={styles.plusBtn}><PlusIcon /></div>
        </Link>
        <Link href="/my-activity" className={`mobile-nav-item ${pathname.startsWith('/my-activity') ? 'active' : ''}`}>
          <FileIcon /><span>My Items</span>
        </Link>
        {isAdmin
          ? <Link href="/admin" className={`mobile-nav-item ${pathname.startsWith('/admin') ? 'active' : ''}`}>
              <ShieldIcon /><span>Admin</span>
            </Link>
          : <Link href="/register" className={`mobile-nav-item`}>
              <UserIcon /><span>Account</span>
            </Link>
        }
      </div>
    </nav>
  );
}

function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function FileIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

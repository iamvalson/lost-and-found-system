'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './NavBar.module.css';

export default function NavBar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>●</span>
          <span className={styles.logoText}>Found</span>
        </Link>

        {/* Centre links */}
        <nav className={styles.links}>
          <Link href="/reports" className={`${styles.link} ${pathname.startsWith('/reports') ? styles.active : ''}`}>Browse</Link>
          {user && <Link href="/my-activity" className={`${styles.link} ${pathname.startsWith('/my-activity') ? styles.active : ''}`}>My Activity</Link>}
          {isAdmin && <Link href="/admin" className={`${styles.link} ${pathname.startsWith('/admin') ? styles.active : ''}`}>Admin</Link>}
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          {user ? (
            <>
              <Link href="/reports/new" className="btn btn-primary btn-sm">+ Report</Link>
              <div className={styles.userMenu}>
                <div className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
                <div className={styles.dropdown}>
                  <div className={styles.dropdownUser}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <hr className={styles.dropdownDivider} />
                  <Link href="/my-activity" className={styles.dropdownItem}>My Activity</Link>
                  {isAdmin && <Link href="/admin" className={styles.dropdownItem}>Admin Panel</Link>}
                  <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

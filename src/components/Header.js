'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { siteConfig } from '@/lib/config';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [titleScrolled, setTitleScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const el = document.getElementById('intro-title');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHome]);

  const showSiteName = !isHome || titleScrolled;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.content}`}>
        <Link
          href="/"
          className={`${styles.siteName} ${showSiteName ? styles.siteNameVisible : ''}`}
          aria-hidden={!showSiteName}
          tabIndex={showSiteName ? undefined : -1}
        >
          {siteConfig.title}
        </Link>
        <nav className={styles.nav} aria-label="Site navigation">
          <Link href="/about" className={styles.navLink}>About</Link>
        </nav>
        <div className={styles.controls}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

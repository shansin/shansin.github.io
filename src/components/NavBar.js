'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './NavBar.module.css';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export default function NavBar() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <nav className={`${styles.nav} ${isHome ? styles.navHome : ''}`} aria-label="Main navigation">
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logo}>
                    Systems and Strides
                </Link>
                <div className={styles.links}>
                    <Link href="/about" className={`${styles.link} ${pathname === '/about' ? styles.active : ''}`}>
                        About
                    </Link>
                    <a href="#subscribe" className={styles.link}>
                        Subscribe
                    </a>
                    <ThemeToggle size="small" />
                </div>
            </div>
        </nav>
    );
}

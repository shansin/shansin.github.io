'use client';

import styles from './Footer.module.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.content}`}>
                <div className={styles.copyright}>
                    &copy; {currentYear} Shantanu Singh
                </div>
                <div className={styles.themeSection}>
                    <ThemeToggle size="small" />
                </div>
                <nav className={styles.links} aria-label="Footer navigation">
                    <Link href="/about" className={styles.link}>
                        About
                    </Link>
                    <a href="/feed.xml" className={styles.link} aria-label="RSS feed">
                        RSS
                    </a>
                    <a href="https://github.com/shansin" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="GitHub profile">
                        Github
                    </a>
                    <a href="https://www.strava.com/athletes/142796564" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="Strava profile">
                        Strava
                    </a>
                    <a href="https://www.linkedin.com/in/singhshantanu/" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="LinkedIn profile">
                        LinkedIn
                    </a>
                </nav>
            </div>
        </footer>
    );
}

import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.content}`}>
                <div>
                    &copy; {currentYear} Shantanu Singh
                </div>
                <div className={styles.links}>
                    <a href="https://www.strava.com/athletes/142796564" target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Strava
                    </a>
                    <a href="https://www.linkedin.com/in/singhshantanu/" target="_blank" rel="noopener noreferrer" className={styles.link}>
                        LinkedIn
                    </a>
                    <a href="https://x.com/shantanu_singh" target="_blank" rel="noopener noreferrer" className={styles.link}>
                        X
                    </a>
                </div>
            </div>
        </footer>
    );
}

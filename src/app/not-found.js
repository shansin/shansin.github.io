import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>404</h2>
            <p className={styles.message}>Page not found</p>
            <Link href="/" className={styles.link}>
                Return Home
            </Link>
        </div>
    );
}

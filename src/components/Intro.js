import Link from 'next/link';
import styles from './Intro.module.css';

export default function Intro({ contentHtml, title }) {
    return (
        <section className={styles.intro}>
            <div className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
                <Link href="/about" className={styles.aboutLink}>
                    About
                </Link>
            </div>
            <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        </section>
    );
}

import styles from './Intro.module.css';

export default function Intro({ contentHtml, title, tagline }) {
    return (
        <section className={styles.intro}>
            <div className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
                {tagline && <p className={styles.tagline}>{tagline}</p>}
            </div>
            <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        </section>
    );
}

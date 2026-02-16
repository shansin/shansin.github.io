import { getMarkdownContent } from '@/lib/markdown';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'About',
    description: 'Software engineer exploring local AI, endurance sports, and the messy reality of building things that break.',
};

export default async function About() {
    const aboutData = await getMarkdownContent('about.md');

    return (
        <main className="container">
            <article className={styles.article}>
                <Link href="/" className={styles.backLink}>← Back to Home</Link>
                <h1>{aboutData.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: aboutData.contentHtml }} />
            </article>
        </main>
    );
}

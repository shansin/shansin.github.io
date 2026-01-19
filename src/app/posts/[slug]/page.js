import { getAllPosts, getPostData } from '@/lib/markdown';
import styles from './page.module.css';
import Link from 'next/link';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.id,
    }));
}

export default async function Post({ params }) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    return (
        <main className="container">
            <div className={styles.article}>
                <Link href="/" className={styles.backLink}>← Back to Home</Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>{postData.title}</h1>
                    <div className={styles.date}>{postData.date}</div>
                    <div className={styles.tags}>
                        {postData.tags.map(tag => <span key={tag} className={styles.tag}>#{tag}</span>)}
                    </div>
                </header>

                <div className={styles.content} dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </div>
        </main>
    );
}

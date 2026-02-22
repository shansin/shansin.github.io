import { getAllPosts, getPostData } from '@/lib/markdown';
import styles from './page.module.css';
import Link from 'next/link';
import { formatDate, getShareUrls } from '@/lib/utils';
import ShareButtons from '@/components/ShareButtons';
import MermaidRenderer from '@/components/MermaidRenderer';
import ExcalidrawRenderer from '@/components/ExcalidrawRenderer';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostData(slug);

    const baseUrl = 'https://shsin.github.io';

    return {
        title: post.title,
        description: post.excerpt || `Read ${post.title} on Systems and Strides`,
        keywords: post.tags,
        authors: [{ name: 'Shantanu Singh' }],
        alternates: {
            canonical: `${baseUrl}/posts/${slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt || `Read ${post.title} on Systems and Strides`,
            url: `${baseUrl}/posts/${slug}`,
            siteName: "Systems and Strides",
            locale: 'en_US',
            type: 'article',
            publishedTime: post.date,
            tags: post.tags,
            ...(post.coverImage && {
                images: [{
                    url: `${baseUrl}${post.coverImage}`,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            creator: '@shantanu_singh',
            title: post.title,
            description: post.excerpt || `Read ${post.title} on Systems and Strides`,
            ...(post.coverImage && {
                images: [`${baseUrl}${post.coverImage}`],
            }),
        },
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.id,
    }));
}

export default async function Post({ params }) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    const shareUrls = getShareUrls(postData.title, `https://shsin.github.io/posts/${slug}`);

    return (
        <main className="container">
            <div className={styles.article}>
                <Link href="/" className={styles.backLink} aria-label="Back to homepage">← Back to Home</Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>{postData.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.date}>{formatDate(postData.date)}</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.readingTime}>{postData.readingTime} min read</span>
                    </div>
                    <div className={styles.tags}>
                        {postData.tags.map(tag => <span key={tag} className={styles.tag}>#{tag}</span>)}
                    </div>
                </header>

                <div className={styles.content} dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
                <MermaidRenderer />
                <ExcalidrawRenderer />

                <footer className={styles.footer}>
                    <ShareButtons urls={shareUrls} title={postData.title} />
                </footer>
            </div>
        </main>
    );
}

'use client';

import { useState } from 'react';
import styles from './BlogList.module.css';
import Link from 'next/link';

export default function BlogList({ posts }) {
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Extract all unique tags
    const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

    const filteredPosts = posts.filter(post => {
        const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesTag && matchesSearch;
    });

    return (
        <section className={styles.container}>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search posts..."
                    className={styles.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className={styles.tags}>
                    <button
                        className={`${styles.tag} ${!selectedTag ? styles.active : ''}`}
                        onClick={() => setSelectedTag(null)}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            className={`${styles.tag} ${selectedTag === tag ? styles.active : ''}`}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.postList}>
                {filteredPosts.map(post => (
                    <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className={styles.post}>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <div className={styles.postDate}>{post.date}</div>
                            <div className={styles.postTags}>
                                {post.tags?.map(tag => (
                                    <span key={tag} className={styles.tag} style={{ cursor: 'default' }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </article>
                    </Link>
                ))}
                {filteredPosts.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)' }}>No posts found.</p>
                )}
            </div>
        </section>
    );
}

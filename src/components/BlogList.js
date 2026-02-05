'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import React from 'react';
import styles from './BlogList.module.css';
import Link from 'next/link';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function BlogList({ posts }) {
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Extract all unique tags - memoized to avoid recalculation on every render
    const allTags = useMemo(() =>
        Array.from(new Set(posts.flatMap(post => post.tags || []))),
        [posts]
    );

    // Filter posts - memoized to avoid recalculation when unrelated state changes
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
            const matchesSearch = debouncedSearchQuery && (
                post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                post.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
            );

            return matchesTag && (matchesSearch || !debouncedSearchQuery);
        });
    }, [posts, selectedTag, debouncedSearchQuery]);

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
                        <article className={`${styles.post} ${post.coverImage ? styles.postWithImage : ''}`}>
                            {post.coverImage && (
                                <div className={styles.postImageWrapper}>
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className={styles.postImage}
                                    />
                                </div>
                            )}
                            <div className={styles.postContent}>
                                <h2 className={styles.postTitle}>{post.title}</h2>
                                <div className={styles.postDate}>{post.date}</div>
                                <p className={styles.postExcerpt}>{post.excerpt}</p>
                                <div className={styles.postTags}>
                                    {post.tags?.map(tag => (
                                        <span key={tag} className={styles.tag} style={{ cursor: 'default' }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
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

export default React.memo(BlogList);

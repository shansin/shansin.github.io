'use client';

import { useState } from 'react';
import styles from './Subscribe.module.css';

export default function Subscribe() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // 'success' | 'error' | null

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) return;

        try {
            const res = await fetch('https://buttondown.com/api/emails/embed-subscribe/systemsandstrides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email }),
            });

            if (res.ok || res.status === 303) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    }

    return (
        <section id="subscribe" className={styles.section}>
            <div className={styles.inner}>
                <h2 className={styles.heading}>Stay in the loop</h2>
                <p className={styles.description}>
                    No spam. Occasional posts about AI, engineering leadership, and endurance sports.
                </p>

                <div className={styles.options}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label htmlFor="subscribe-email" className="visually-hidden">Email address</label>
                        <input
                            id="subscribe-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <button type="submit" className={styles.button}>
                            Subscribe
                        </button>
                    </form>

                    <div className={styles.rss}>
                        <a href="/feed.xml" className={styles.rssLink} aria-label="RSS Feed">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 11a9 9 0 0 1 9 9" />
                                <path d="M4 4a16 16 0 0 1 16 16" />
                                <circle cx="5" cy="19" r="1" />
                            </svg>
                            RSS Feed
                        </a>
                    </div>
                </div>

                {status === 'success' && (
                    <p className={styles.successMsg}>Check your email to confirm your subscription.</p>
                )}
                {status === 'error' && (
                    <p className={styles.errorMsg}>Something went wrong. Try again or use the RSS feed.</p>
                )}
            </div>
        </section>
    );
}

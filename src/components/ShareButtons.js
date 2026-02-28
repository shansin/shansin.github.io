'use client';

import { useState } from 'react';
import styles from './ShareButtons.module.css';

export default function ShareButtons({ urls, title }) {
    const [toastVisible, setToastVisible] = useState(false);

    const handleShare = (url, platform) => {
        if (platform === 'email') {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Share this post</h3>
            <div className={styles.buttons} role="group" aria-label="Share on social media">
                <button 
                    onClick={() => handleShare(urls.twitter, 'twitter')}
                    className={styles.button}
                    aria-label="Share on X (Twitter)"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Twitter</span>
                </button>
                <button 
                    onClick={() => handleShare(urls.linkedin, 'linkedin')}
                    className={styles.button}
                    aria-label="Share on LinkedIn"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                </button>
                <button 
                    onClick={() => handleShare(urls.email, 'email')}
                    className={styles.button}
                    aria-label="Share via email"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span>Email</span>
                </button>
                <button 
                    onClick={copyToClipboard}
                    className={styles.button}
                    aria-label="Copy link to clipboard"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    <span>Copy Link</span>
                </button>
            </div>
            <div className={`${styles.toast} ${toastVisible ? styles.visible : ''}`}>
                Link copied to clipboard!
            </div>
        </div>
    );
}

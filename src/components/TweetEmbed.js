'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TweetEmbed() {
    const { theme } = useTheme();
    const renderIdRef = useRef(0);

    useEffect(() => {
        const placeholders = document.querySelectorAll('.tweet-embed-placeholder');
        if (placeholders.length === 0) return;

        const currentRenderId = ++renderIdRef.current;

        function renderTweets() {
            if (currentRenderId !== renderIdRef.current) return;
            placeholders.forEach((el) => {
                const tweetId = el.dataset.tweetId;
                if (!tweetId) return;

                el.innerHTML = '';
                window.twttr.widgets.createTweet(tweetId, el, {
                    theme: theme === 'dark' ? 'dark' : 'light',
                    dnt: true,
                    align: 'center',
                }).then(() => {
                    // If a newer render cycle started, clear stale tweet
                    if (currentRenderId !== renderIdRef.current) {
                        el.innerHTML = '';
                    }
                });
            });
        }

        if (window.twttr && window.twttr.widgets) {
            renderTweets();
        } else {
            const existing = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
            if (existing) existing.remove();

            window.twttr = window.twttr || {};
            window.twttr._e = window.twttr._e || [];
            window.twttr.ready = window.twttr.ready || function (fn) {
                window.twttr._e.push(fn);
            };

            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            script.charset = 'utf-8';
            document.body.appendChild(script);

            window.twttr.ready(renderTweets);
        }

        return () => {
            placeholders.forEach((el) => {
                el.innerHTML = '';
            });
        };
    }, [theme]);

    return null;
}

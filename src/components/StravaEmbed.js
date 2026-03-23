'use client';
import { useEffect } from 'react';

/**
 * Loads the official Strava embed.js script which hydrates any
 * .strava-embed-placeholder divs on the page into rich activity cards.
 */
export default function StravaEmbed() {
    useEffect(() => {
        const placeholders = document.querySelectorAll('.strava-embed-placeholder');
        if (placeholders.length === 0) return;

        const existing = document.querySelector('script[src="https://strava-embeds.com/embed.js"]');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.src = 'https://strava-embeds.com/embed.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    return null;
}

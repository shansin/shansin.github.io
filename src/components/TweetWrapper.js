'use client';
import dynamic from 'next/dynamic';

const TweetEmbed = dynamic(() => import('./TweetEmbed'), { ssr: false });

export default function TweetWrapper() {
    return <TweetEmbed />;
}

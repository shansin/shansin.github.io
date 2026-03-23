'use client';
import dynamic from 'next/dynamic';

const StravaEmbed = dynamic(() => import('./StravaEmbed'), { ssr: false });

export default function StravaWrapper() {
    return <StravaEmbed />;
}

'use client';
import dynamic from 'next/dynamic';

const ExcalidrawRenderer = dynamic(() => import('./ExcalidrawRenderer'), { ssr: false });

export default function ExcalidrawWrapper() {
    return <ExcalidrawRenderer />;
}

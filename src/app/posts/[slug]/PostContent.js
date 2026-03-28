'use client';

import { useRef, useState, useCallback } from 'react';
import styles from './page.module.css';
import ImageLightbox from '@/components/ImageLightbox';

export default function PostContent({ contentHtml }) {
    const contentRef = useRef(null);
    const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0, images: [] });

    const handleContentClick = useCallback((e) => {
        const img = e.target.closest('img');
        if (!img || img.src.endsWith('.svg')) return;

        const container = contentRef.current;
        if (!container) return;

        const allImages = Array.from(container.querySelectorAll('img'))
            .filter(i => !i.src.endsWith('.svg'));
        const index = allImages.indexOf(img);
        if (index === -1) return;

        const images = allImages.map(i => ({ src: i.src, alt: i.alt }));
        setLightbox({ isOpen: true, currentIndex: index, images });
    }, []);

    const close = useCallback(() => {
        setLightbox(prev => ({ ...prev, isOpen: false }));
    }, []);

    const prev = useCallback(() => {
        setLightbox(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }, []);

    const next = useCallback(() => {
        setLightbox(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }, []);

    return (
        <>
            <div
                ref={contentRef}
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
                onClick={handleContentClick}
            />
            <ImageLightbox
                isOpen={lightbox.isOpen}
                images={lightbox.images}
                currentIndex={lightbox.currentIndex}
                onClose={close}
                onPrev={prev}
                onNext={next}
            />
        </>
    );
}

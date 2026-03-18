'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import ImageLightbox from '@/components/ImageLightbox';

export default function PostContent({ contentHtml }) {
    const contentRef = useRef(null);
    const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0, images: [] });

    useEffect(() => {
        const container = contentRef.current;
        if (!container) return;

        const imgElements = container.querySelectorAll('img:not(.svg)');
        const images = Array.from(imgElements)
            .filter(img => !img.src.endsWith('.svg'))
            .map(img => ({ src: img.src, alt: img.alt }));

        const handleClick = (index) => () => {
            setLightbox({ isOpen: true, currentIndex: index, images });
        };

        const cleanups = [];
        let idx = 0;
        imgElements.forEach(img => {
            if (img.src.endsWith('.svg')) return;
            const handler = handleClick(idx++);
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', handler);
            cleanups.push(() => img.removeEventListener('click', handler));
        });

        return () => cleanups.forEach(fn => fn());
    }, [contentHtml]);

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

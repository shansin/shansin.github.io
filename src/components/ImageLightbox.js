'use client';

import { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styles from './ImageLightbox.module.css';

export default function ImageLightbox({ isOpen, images, currentIndex, onClose, onNext, onPrev }) {
    const panelRef = useRef(null);
    const previousFocusRef = useRef(null);
    const touchStartRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowLeft':
                if (currentIndex > 0) onPrev();
                break;
            case 'ArrowRight':
                if (currentIndex < images.length - 1) onNext();
                break;
        }
    }, [onClose, onPrev, onNext, currentIndex, images.length]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            // Focus panel after render
            requestAnimationFrame(() => panelRef.current?.focus());
        } else {
            document.body.style.overflow = '';
            previousFocusRef.current?.focus();
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartRef.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartRef.current;
        touchStartRef.current = null;
        if (Math.abs(delta) < 50) return;
        if (delta > 0 && currentIndex > 0) onPrev();
        if (delta < 0 && currentIndex < images.length - 1) onNext();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    const current = images[currentIndex];

    return ReactDOM.createPortal(
        <div
            className={`${styles.overlay} ${styles.open}`}
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
        >
            <div className={styles.panel} ref={panelRef} tabIndex={-1}>
                <img
                    src={current.src}
                    alt={current.alt || ''}
                    className={styles.image}
                    draggable={false}
                />
                {current.alt && <p className={styles.alt}>{current.alt}</p>}
            </div>

            <button className={styles.close} onClick={onClose} aria-label="Close">
                ✕
            </button>

            {images.length > 1 && (
                <>
                    <button
                        className={`${styles.nav} ${styles.prev}`}
                        onClick={onPrev}
                        disabled={currentIndex === 0}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                    <button
                        className={`${styles.nav} ${styles.next}`}
                        onClick={onNext}
                        disabled={currentIndex === images.length - 1}
                        aria-label="Next image"
                    >
                        ›
                    </button>
                    <div className={styles.counter}>
                        {currentIndex + 1} of {images.length}
                    </div>
                </>
            )}
        </div>,
        document.body
    );
}

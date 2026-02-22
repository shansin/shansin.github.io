'use client';

import { useEffect } from 'react';

export default function MermaidRenderer() {
    useEffect(() => {
        let cancelled = false;

        async function renderMermaid() {
            const mermaid = (await import('mermaid')).default;

            if (cancelled) return;

            // Detect current theme
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

            mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'loose',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                theme: 'base',
                themeVariables: isDark
                    ? {
                        // Dark theme
                        primaryColor: '#1e3a5f',
                        primaryTextColor: '#e2e8f0',
                        primaryBorderColor: '#3b82f6',
                        secondaryColor: '#1a2332',
                        secondaryTextColor: '#cbd5e1',
                        secondaryBorderColor: '#475569',
                        tertiaryColor: '#0f172a',
                        tertiaryTextColor: '#94a3b8',
                        lineColor: '#64748b',
                        textColor: '#e2e8f0',
                        mainBkg: '#1e293b',
                        nodeBorder: '#3b82f6',
                        clusterBkg: '#0f172a80',
                        clusterBorder: '#334155',
                        titleColor: '#f1f5f9',
                        edgeLabelBackground: '#1e293b',
                        nodeTextColor: '#e2e8f0',
                    }
                    : {
                        // Light theme
                        primaryColor: '#dbeafe',
                        primaryTextColor: '#1e293b',
                        primaryBorderColor: '#3b82f6',
                        secondaryColor: '#f0f9ff',
                        secondaryTextColor: '#334155',
                        secondaryBorderColor: '#93c5fd',
                        tertiaryColor: '#eff6ff',
                        tertiaryTextColor: '#475569',
                        lineColor: '#64748b',
                        textColor: '#1e293b',
                        mainBkg: '#dbeafe',
                        nodeBorder: '#3b82f6',
                        clusterBkg: '#f0f9ff',
                        clusterBorder: '#93c5fd',
                        titleColor: '#0f172a',
                        edgeLabelBackground: '#ffffff',
                        nodeTextColor: '#1e293b',
                    },
            });

            // Find all mermaid containers and render them
            const elements = document.querySelectorAll('.mermaid');
            if (elements.length > 0) {
                // Reset any previously rendered diagrams so re-render works
                elements.forEach((el) => {
                    if (el.getAttribute('data-processed')) {
                        el.removeAttribute('data-processed');
                        const source = el.getAttribute('data-source');
                        if (source) {
                            el.innerHTML = source;
                        }
                    } else {
                        el.setAttribute('data-source', el.textContent);
                    }
                });

                await mermaid.run({ nodes: elements });
            }
        }

        renderMermaid();

        // Re-render on theme change
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'data-theme') {
                    renderMermaid();
                    break;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, []);

    return null;
}

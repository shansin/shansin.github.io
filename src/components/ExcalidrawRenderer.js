'use client';
import { useEffect } from 'react';

/**
 * Lightweight client-side renderer for Excalidraw diagrams.
 *
 * Converts Excalidraw scene JSON into inline SVG without the heavy
 * @excalidraw/excalidraw dependency. Supports rectangles, text, arrows,
 * ellipses, and diamonds with fill, stroke, and font styles.
 */
export default function ExcalidrawRenderer() {
    useEffect(() => {
        let observer = null;

        function renderAll() {
            const containers = document.querySelectorAll('.excalidraw-diagram[data-scene]');
            if (containers.length === 0) return;

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

            for (const container of containers) {
                try {
                    const json = atob(container.getAttribute('data-scene'));
                    const scene = JSON.parse(json);
                    const svg = renderScene(scene, isDark);
                    container.innerHTML = '';
                    container.appendChild(svg);
                } catch (err) {
                    console.error('[ExcalidrawRenderer]', err);
                    container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:1rem">📐 Excalidraw diagram could not be rendered</p>`;
                }
            }
        }

        renderAll();

        // Re-render when theme changes
        observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'data-theme') {
                    renderAll();
                    break;
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true });

        return () => { if (observer) observer.disconnect(); };
    }, []);

    return null;
}

/* ── SVG generation ─────────────────────────────────────── */

function renderScene(scene, isDark) {
    const elements = (scene.elements || []).filter(e => !e.isDeleted);
    if (elements.length === 0) return document.createElement('p');

    // Compute bounding box
    const pad = 24;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of elements) {
        const x1 = el.x;
        const y1 = el.y;
        const x2 = el.x + (el.width || 0);
        const y2 = el.y + (el.height || 0);
        if (el.type === 'arrow' || el.type === 'line') {
            for (const pt of (el.points || [])) {
                minX = Math.min(minX, el.x + pt[0]);
                minY = Math.min(minY, el.y + pt[1]);
                maxX = Math.max(maxX, el.x + pt[0]);
                maxY = Math.max(maxY, el.y + pt[1]);
            }
        } else {
            minX = Math.min(minX, x1);
            minY = Math.min(minY, y1);
            maxX = Math.max(maxX, x2);
            maxY = Math.max(maxY, y2);
        }
    }

    const width = maxX - minX + pad * 2;
    const height = maxY - minY + pad * 2;
    const offsetX = -minX + pad;
    const offsetY = -minY + pad;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    // Background
    const bgColor = isDark ? '#1e1e2e' : '#ffffff';
    const bg = svgEl('rect', { x: 0, y: 0, width, height, fill: bgColor, rx: 8 });
    svg.appendChild(bg);

    // Arrow marker
    const defs = svgEl('defs');
    const markerColor = isDark ? '#cdd6f4' : '#1e1e1e';
    const marker = svgEl('marker', {
        id: 'arrowhead', markerWidth: 10, markerHeight: 7,
        refX: 10, refY: 3.5, orient: 'auto', fill: markerColor,
    });
    marker.appendChild(svgEl('polygon', { points: '0 0, 10 3.5, 0 7' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Sort: draw shapes first, then lines/arrows, then text last
    const order = { rectangle: 0, ellipse: 0, diamond: 0, arrow: 1, line: 1, text: 2 };
    const sorted = [...elements].sort((a, b) => (order[a.type] ?? 0) - (order[b.type] ?? 0));

    for (const el of sorted) {
        const g = svgEl('g', {
            transform: `translate(${el.x + offsetX}, ${el.y + offsetY})`,
            opacity: (el.opacity ?? 100) / 100,
        });

        switch (el.type) {
            case 'rectangle':
                drawRect(g, el, isDark);
                break;
            case 'ellipse':
                drawEllipse(g, el, isDark);
                break;
            case 'diamond':
                drawDiamond(g, el, isDark);
                break;
            case 'arrow':
            case 'line':
                drawArrow(g, el, isDark);
                break;
            case 'text':
                if (!el.containerId) drawText(g, el, isDark);
                break;
        }

        svg.appendChild(g);
    }

    // Draw bound text (text inside shapes) on top
    for (const el of elements) {
        if (el.type === 'text' && el.containerId) {
            const container = elements.find(e => e.id === el.containerId);
            if (!container) continue;
            const cx = container.x + container.width / 2 + offsetX;
            const cy = container.y + container.height / 2 + offsetY;
            const g = svgEl('g', {
                transform: `translate(${cx}, ${cy})`,
                opacity: (el.opacity ?? 100) / 100,
            });
            drawBoundText(g, el, isDark);
            svg.appendChild(g);
        }
    }

    return svg;
}

function drawRect(g, el, isDark) {
    const fill = resolveColor(el.backgroundColor, isDark);
    const stroke = resolveColor(el.strokeColor, isDark);
    const rx = el.roundness ? Math.min(el.width, el.height) * 0.1 : 0;
    g.appendChild(svgEl('rect', {
        x: 0, y: 0,
        width: el.width, height: el.height,
        fill: fill === 'transparent' ? 'none' : fill,
        stroke, 'stroke-width': el.strokeWidth || 1,
        rx,
    }));
}

function drawEllipse(g, el, isDark) {
    const fill = resolveColor(el.backgroundColor, isDark);
    const stroke = resolveColor(el.strokeColor, isDark);
    g.appendChild(svgEl('ellipse', {
        cx: el.width / 2, cy: el.height / 2,
        rx: el.width / 2, ry: el.height / 2,
        fill: fill === 'transparent' ? 'none' : fill,
        stroke, 'stroke-width': el.strokeWidth || 1,
    }));
}

function drawDiamond(g, el, isDark) {
    const fill = resolveColor(el.backgroundColor, isDark);
    const stroke = resolveColor(el.strokeColor, isDark);
    const w = el.width, h = el.height;
    const points = `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`;
    g.appendChild(svgEl('polygon', {
        points,
        fill: fill === 'transparent' ? 'none' : fill,
        stroke, 'stroke-width': el.strokeWidth || 1,
    }));
}

function drawArrow(g, el, isDark) {
    const stroke = resolveColor(el.strokeColor, isDark);
    const pts = el.points || [];
    if (pts.length < 2) return;
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    const attrs = {
        d, fill: 'none', stroke,
        'stroke-width': el.strokeWidth || 1,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    };
    if (el.type === 'arrow' && el.endArrowhead === 'arrow') {
        attrs['marker-end'] = 'url(#arrowhead)';
    }
    g.appendChild(svgEl('path', attrs));
}

function drawText(g, el, isDark) {
    const fill = resolveColor(el.strokeColor, isDark);
    const lines = (el.text || '').split('\n');
    const fontSize = el.fontSize || 16;
    const lineHeight = fontSize * (el.lineHeight || 1.25);
    const fontFamily = getFontFamily(el.fontFamily);

    lines.forEach((line, i) => {
        const t = svgEl('text', {
            x: el.width / 2,
            y: fontSize + i * lineHeight,
            'text-anchor': 'middle',
            'dominant-baseline': 'auto',
            fill,
            'font-size': fontSize,
            'font-family': fontFamily,
        });
        t.textContent = line;
        g.appendChild(t);
    });
}

function drawBoundText(g, el, isDark) {
    const fill = resolveColor(el.strokeColor, isDark);
    const lines = (el.text || '').split('\n');
    const fontSize = el.fontSize || 16;
    const lineHeight = fontSize * (el.lineHeight || 1.25);
    const fontFamily = getFontFamily(el.fontFamily);
    const totalHeight = lines.length * lineHeight;

    lines.forEach((line, i) => {
        const t = svgEl('text', {
            x: 0,
            y: -totalHeight / 2 + fontSize + i * lineHeight,
            'text-anchor': 'middle',
            'dominant-baseline': 'auto',
            fill,
            'font-size': fontSize,
            'font-family': fontFamily,
        });
        t.textContent = line;
        g.appendChild(t);
    });
}

/* ── Helpers ─────────────────────────────────────────────── */

function svgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

// Complete Excalidraw palette → dark-mode mapping.
// Stroke colors (dark originals → light for dark bg)
// Background fills (light pastels → deeper saturated variants)
const EXCALIDRAW_COLORS = {
    // ── Stroke / text colors ──
    '#1e1e1e': { dark: '#e2e8f0' },   // default black → light gray
    '#1971c2': { dark: '#89b4fa' },    // blue
    '#2f9e44': { dark: '#a6e3a1' },    // green
    '#e03131': { dark: '#f38ba8' },    // red
    '#f08c00': { dark: '#fab387' },    // orange
    '#6741d9': { dark: '#cba6f7' },    // purple
    '#0c8599': { dark: '#94e2d5' },    // teal
    '#e8590c': { dark: '#fab387' },    // dark orange
    '#000000': { dark: '#e2e8f0' },    // pure black → light

    // ── Background fill colors (pastels → deeper tones) ──
    '#a5d8ff': { dark: '#1e3a5f' },    // light blue → deep blue
    '#ffec99': { dark: '#5c4a1e' },    // light yellow → deep amber
    '#b2f2bb': { dark: '#1e4d2b' },    // light green → deep green
    '#d0bfff': { dark: '#3b2d6b' },    // light purple → deep purple
    '#ffc9c9': { dark: '#5c1e1e' },    // light red → deep red
    '#ffd8a8': { dark: '#5c3a1e' },    // light orange → deep orange
    '#99e9f2': { dark: '#1e3d42' },    // light cyan → deep cyan
    '#eebefa': { dark: '#4a1e5c' },    // light pink → deep pink
    '#ffffff': { dark: '#1e1e2e' },    // white → dark bg
    '#e9ecef': { dark: '#2a2a3a' },    // gray fill → dark gray
};

function resolveColor(color, isDark) {
    if (!color || color === 'transparent') return 'transparent';
    if (isDark && EXCALIDRAW_COLORS[color]?.dark) return EXCALIDRAW_COLORS[color].dark;
    return color;
}

function getFontFamily(family) {
    switch (family) {
        case 1: return 'Virgil, Segoe UI Emoji, sans-serif';
        case 2: return 'Helvetica, Arial, sans-serif';
        case 3: return 'Cascadia, monospace';
        default: return 'Virgil, Segoe UI Emoji, sans-serif';
    }
}

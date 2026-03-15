#!/usr/bin/env node
/**
 * Image optimization script.
 * Converts PNG/JPG images in public/images/ to WebP format.
 * Skips files that already have an up-to-date WebP version.
 * Run via: npm run optimize-images
 * Also runs automatically as part of: npm run build
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
    sharp = require('sharp');
} catch {
    console.warn('[optimize-images] sharp not installed, skipping image optimization.');
    process.exit(0);
}

const IMAGES_DIR = path.join(__dirname, '../public/images');
const CONTENT_DIR = path.join(__dirname, '../content');
const WEBP_QUALITY = 80;
const MAX_WIDTH = 1600; // Resize if wider than this

function walkDir(dir, results = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, results);
        } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

async function optimizeImage(srcPath) {
    const dir = path.dirname(srcPath);
    const ext = path.extname(srcPath);
    const base = path.basename(srcPath, ext);
    const destPath = path.join(dir, `${base}.webp`);

    // Skip if WebP already exists and is newer than source
    if (fs.existsSync(destPath)) {
        const srcMtime = fs.statSync(srcPath).mtimeMs;
        const destMtime = fs.statSync(destPath).mtimeMs;
        if (destMtime >= srcMtime) {
            return { path: srcPath, skipped: true };
        }
    }

    const srcSize = fs.statSync(srcPath).size;
    await sharp(srcPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(destPath);

    const destSize = fs.statSync(destPath).size;
    const savings = Math.round((1 - destSize / srcSize) * 100);
    return { path: srcPath, dest: destPath, srcSize, destSize, savings, skipped: false };
}

function walkMdFiles(dir, results = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkMdFiles(fullPath, results);
        } else if (entry.name.endsWith('.md')) {
            results.push(fullPath);
        }
    }
    return results;
}

function updateMarkdownReferences(convertedPaths) {
    if (convertedPaths.length === 0) return 0;

    // Build a set of basenames that were converted (relative to public/)
    const convertedSet = new Set(
        convertedPaths.map(p => path.relative(path.join(__dirname, '../public'), p))
    );

    if (!fs.existsSync(CONTENT_DIR)) return 0;

    const mdFiles = walkMdFiles(CONTENT_DIR);
    let updatedFiles = 0;

    for (const mdPath of mdFiles) {
        const original = fs.readFileSync(mdPath, 'utf8');
        // Replace .png/.jpg/.jpeg references where a webp counterpart was created
        const updated = original.replace(/(\/(images\/[^\s"')]+?))\.(png|jpg|jpeg)/gi, (match, withoutExt, _base, ext) => {
            const candidate = `${withoutExt.slice(1)}.png`; // strip leading /
            const candidateJpg = `${withoutExt.slice(1)}.${ext}`;
            if (convertedSet.has(candidate) || convertedSet.has(candidateJpg) ||
                convertedSet.has(`${withoutExt.slice(1)}.PNG`) || convertedSet.has(`${withoutExt.slice(1)}.JPG`)) {
                return `${withoutExt}.webp`;
            }
            return match;
        });
        if (updated !== original) {
            fs.writeFileSync(mdPath, updated, 'utf8');
            const rel = path.relative(path.join(__dirname, '..'), mdPath);
            console.log(`  ✎ Updated references in ${rel}`);
            updatedFiles++;
        }
    }
    return updatedFiles;
}

async function main() {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.log('[optimize-images] No public/images directory found, skipping.');
        return;
    }

    const images = walkDir(IMAGES_DIR);
    if (images.length === 0) {
        console.log('[optimize-images] No images found.');
        return;
    }

    console.log(`[optimize-images] Processing ${images.length} image(s)...`);
    let converted = 0;
    let skipped = 0;
    let totalSaved = 0;
    const convertedPaths = [];

    for (const img of images) {
        try {
            const result = await optimizeImage(img);
            if (result.skipped) {
                skipped++;
                convertedPaths.push(img); // already has a webp — still update refs
            } else {
                converted++;
                totalSaved += result.srcSize - result.destSize;
                convertedPaths.push(img);
                const rel = path.relative(path.join(__dirname, '..'), img);
                console.log(`  ✓ ${rel} → .webp (${result.savings}% smaller)`);
            }
        } catch (err) {
            console.error(`  ✗ ${img}: ${err.message}`);
        }
    }

    const updatedFiles = updateMarkdownReferences(convertedPaths);
    const savedMB = (totalSaved / 1024 / 1024).toFixed(1);
    console.log(`[optimize-images] Done. Converted: ${converted}, skipped: ${skipped}, saved: ${savedMB} MB, markdown files updated: ${updatedFiles}`);
}

main().catch(err => {
    console.error('[optimize-images] Fatal error:', err);
    process.exit(1);
});

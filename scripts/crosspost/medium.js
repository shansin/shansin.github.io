#!/usr/bin/env node
const { SITE_URL, openInBrowser } = require('./utils');

const IMPORT_URL = 'https://medium.com/p/import';

function openMediumImport(slug) {
    const postUrl = encodeURIComponent(`${SITE_URL}/posts/${slug}`);
    const url = `${IMPORT_URL}?url=${postUrl}`;

    try {
        openInBrowser(url);
        console.log(`  [medium] Opened import page in browser`);
        console.log(`  [medium] URL: ${url}`);
        return 'imported';
    } catch (err) {
        console.log(`  [medium] Could not open browser. Import manually:`);
        console.log(`  [medium] ${url}`);
        return 'manual';
    }
}

module.exports = { openMediumImport };

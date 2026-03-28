#!/usr/bin/env node
const { openInBrowser, copyToClipboard } = require('./utils');

function openSubstackDraft({ html }) {
    try {
        copyToClipboard(html);
        console.log(`  [substack] Copied post HTML to clipboard`);
    } catch {
        console.log(`  [substack] Could not copy to clipboard — HTML logged below`);
    }

    const url = 'https://substack.com/home/post/editor';
    try {
        openInBrowser(url);
        console.log(`  [substack] Opened editor in browser — paste from clipboard`);
    } catch {
        console.log(`  [substack] Could not open browser. Go to: ${url}`);
    }

    return 'manual';
}

module.exports = { openSubstackDraft };

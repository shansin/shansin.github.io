#!/usr/bin/env node
const { execSync } = require('child_process');

const SITE_URL = 'https://shsin.blog';

function openInBrowser(url) {
    const cmd = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'start'
        : 'xdg-open';

    execSync(`${cmd} "${url}"`, { stdio: 'ignore' });
}

function copyToClipboard(text) {
    const platform = process.platform;
    if (platform === 'darwin') {
        execSync('pbcopy', { input: text });
    } else if (platform === 'linux') {
        execSync('xclip -selection clipboard', { input: text });
    } else if (platform === 'win32') {
        execSync('clip', { input: text });
    }
}

module.exports = { SITE_URL, openInBrowser, copyToClipboard };

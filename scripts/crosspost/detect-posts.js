#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../../content/posts');
const TRACKING_FILE = path.join(__dirname, '../../crossposted.json');

function loadTracking() {
    try {
        return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function getChangedPostFiles() {
    try {
        const output = execSync('git diff --name-only HEAD~1 HEAD -- content/posts/', {
            encoding: 'utf8',
            cwd: path.join(__dirname, '../..')
        }).trim();
        if (!output) return [];
        return output.split('\n').filter(f => f.endsWith('.md'));
    } catch {
        console.log('[crosspost] Could not run git diff, falling back to --all mode.');
        return null;
    }
}

function getAllPostFiles() {
    return fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => `content/posts/${f}`);
}

function isTemplateOrDraft(filename) {
    const base = path.basename(filename);
    return base.startsWith('0-') || base.startsWith('1-draft-');
}

/** Parse a single post file by slug. Returns null if not found or draft. */
function parsePost(slug) {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const { content, data } = matter(raw);
        if (data.draft) return null;
        return { slug, frontmatter: data, rawMarkdown: content };
    } catch {
        return null;
    }
}

function detectPosts({ all = false } = {}) {
    const tracking = loadTracking();
    const isEmpty = Object.keys(tracking).length === 0;

    let files;
    if (all || isEmpty) {
        console.log('[crosspost] Running in --all mode: checking all published posts.');
        files = getAllPostFiles();
    } else {
        files = getChangedPostFiles();
        if (files === null) {
            files = getAllPostFiles();
        }
    }

    const posts = [];

    for (const filePath of files) {
        if (isTemplateOrDraft(filePath)) continue;

        const fullPath = path.join(__dirname, '../..', filePath);
        try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            const { content, data } = matter(raw);
            const slug = path.basename(filePath, '.md');

            if (data.draft) continue;
            if (data.crosspost === false) continue;
            if (tracking[slug]) continue;

            posts.push({ slug, frontmatter: data, rawMarkdown: content });
        } catch {
            continue;
        }
    }

    return { posts, tracking };
}

module.exports = { detectPosts, parsePost, TRACKING_FILE };

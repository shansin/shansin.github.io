#!/usr/bin/env node
const fs = require('fs');
const { detectPosts, parsePost, TRACKING_FILE } = require('./detect-posts');
const { transformForCrosspost } = require('./transform');
const { openMediumImport } = require('./medium');
const { openSubstackDraft } = require('./substack');
const { SITE_URL } = require('./utils');

const DRY_RUN = process.argv.includes('--dry-run');
const ALL_MODE = process.argv.includes('--all');
const MEDIUM_ONLY = process.argv.includes('--medium');
const SUBSTACK_ONLY = process.argv.includes('--substack');
const RUN_MEDIUM = MEDIUM_ONLY || !SUBSTACK_ONLY;
const RUN_SUBSTACK = SUBSTACK_ONLY || !MEDIUM_ONLY;

const slugArgs = process.argv.slice(2).filter(a => !a.startsWith('--'));

function usage() {
    console.log(`
Usage: npm run crosspost -- [options] [slug...]

  Cross-post blog posts to Medium and Substack.
  Medium: opens "Import a Story" in your browser (auto-imports content + canonical URL).
  Substack: copies post HTML to clipboard and opens the editor for pasting.

Options:
  --dry-run      Preview what would be cross-posted without doing anything
  --all          Process all published posts (not just changed ones)
  --medium       Only cross-post to Medium
  --substack     Only cross-post to Substack

Examples:
  npm run crosspost                          # Cross-post changed posts to both platforms
  npm run crosspost -- --all                 # Cross-post all published posts
  npm run crosspost -- rest-days             # Cross-post a specific post
  npm run crosspost -- --medium rest-days    # Import a specific post to Medium only
  npm run crosspost -- --dry-run --all       # Preview all posts without acting
`);
}

if (process.argv.includes('--help')) {
    usage();
    process.exit(0);
}

async function main() {
    console.log(`[crosspost] Starting${DRY_RUN ? ' (dry run)' : ''}...`);

    let { posts, tracking } = detectPosts({ all: ALL_MODE });

    if (slugArgs.length > 0) {
        posts = posts.filter(p => slugArgs.includes(p.slug));
        if (posts.length === 0) {
            for (const slug of slugArgs) {
                const post = parsePost(slug);
                if (!post) {
                    console.log(`[crosspost] Post not found or is a draft: ${slug}`);
                    continue;
                }
                posts.push(post);
            }
        }
    }

    if (posts.length === 0) {
        console.log('[crosspost] No posts to cross-post.');
        return;
    }

    console.log(`[crosspost] Found ${posts.length} post(s) to cross-post:`);
    posts.forEach(p => console.log(`  - ${p.slug}`));

    let updated = false;

    for (const post of posts) {
        console.log(`\n[crosspost] Processing: ${post.slug}`);

        const entry = tracking[post.slug] || { crosspostedAt: new Date().toISOString() };

        if (RUN_MEDIUM) {
            if (DRY_RUN) {
                console.log(`  [medium] DRY RUN — would open import for "${post.frontmatter.title}"`);
                console.log(`  [medium] URL: ${SITE_URL}/posts/${post.slug}`);
            } else {
                const status = openMediumImport(post.slug);
                entry.medium = status;
            }
        }

        if (RUN_SUBSTACK) {
            try {
                const { html } = await transformForCrosspost(
                    post.rawMarkdown, post.frontmatter, post.slug
                );

                if (DRY_RUN) {
                    console.log(`  [substack] DRY RUN — would copy HTML and open editor for "${post.frontmatter.title}"`);
                    console.log(`  [substack] HTML length: ${html.length} chars`);
                } else {
                    const status = openSubstackDraft({ html });
                    entry.substack = status;
                }
            } catch (err) {
                console.error(`  [substack] ERROR: ${err.message}`);
                entry.substack = 'error';
            }
        }

        if (!DRY_RUN && posts.length > 1) {
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!DRY_RUN) {
            entry.crosspostedAt = new Date().toISOString();
            tracking[post.slug] = entry;
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2) + '\n');
        console.log('\n[crosspost] Updated crossposted.json');
    } else {
        console.log('\n[crosspost] Dry run — tracking file not updated.');
    }

    console.log('[crosspost] Done.');
}

main().catch(err => {
    console.error('[crosspost] Fatal error:', err);
    process.exit(1);
});

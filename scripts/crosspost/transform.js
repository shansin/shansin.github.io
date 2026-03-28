#!/usr/bin/env node

const { SITE_URL } = require('./utils');

// ESM modules and processor cached after first load
let _processor;

async function loadProcessor() {
    if (!_processor) {
        const [remarkMod, gfmMod, rehypeMod, stringifyMod] = await Promise.all([
            import('remark'),
            import('remark-gfm'),
            import('remark-rehype'),
            import('rehype-stringify')
        ]);
        // Intentionally a simplified pipeline vs src/lib/markdown.js —
        // if new embed types are added there, update convertEmbeds here too.
        _processor = remarkMod.remark()
            .use(gfmMod.default)
            .use(rehypeMod.default, { allowDangerousHtml: true })
            .use(stringifyMod.default, { allowDangerousHtml: true });
    }
    return _processor;
}

/**
 * Convert custom embed syntax to plain URLs that Medium/Substack understand.
 * Operates on raw markdown before remark processing.
 */
function convertEmbeds(markdown, slug) {
    let result = markdown;

    result = result.replace(
        /@\[youtube\]\(([^)]+)\)(\{[^}]*\})?/g,
        (_, id) => `[Watch on YouTube](https://www.youtube.com/watch?v=${id})`
    );

    result = result.replace(
        /@\[tweet\]\(([^)]+)\)/g,
        (_, id) => `[View on X](https://x.com/i/status/${id})`
    );

    result = result.replace(
        /@\[strava\]\(([^)]+)\)(\{[^}]*\})?/g,
        (_, id) => `[View on Strava](https://www.strava.com/activities/${id})`
    );

    result = result.replace(
        /@\[excalidraw\]\(([^)]+)\)/g,
        () => `*[Diagram — view on original post](${SITE_URL}/posts/${slug})*`
    );

    return result;
}

function absolutizeImages(markdown) {
    let result = markdown.replace(
        /!\[([^\]]*)\]\(\/(images\/[^)]+)\)/g,
        (_, alt, imgPath) => `![${alt}](${SITE_URL}/${imgPath})`
    );

    result = result.replace(
        /src="\/images\//g,
        `src="${SITE_URL}/images/`
    );

    return result;
}

async function transformForCrosspost(rawMarkdown, frontmatter, slug) {
    const processor = await loadProcessor();

    let markdown = rawMarkdown;

    markdown = convertEmbeds(markdown, slug);
    markdown = absolutizeImages(markdown);

    if (frontmatter.coverImage) {
        const coverUrl = frontmatter.coverImage.startsWith('/')
            ? `${SITE_URL}${frontmatter.coverImage}`
            : frontmatter.coverImage;
        markdown = `![${frontmatter.title}](${coverUrl})\n\n${markdown}`;
    }

    markdown += `\n\n---\n\n*Originally published at [shsin.blog](${SITE_URL}/posts/${slug})*`;

    const result = await processor.process(markdown);
    return {
        markdown,
        html: result.toString()
    };
}

module.exports = { transformForCrosspost, convertEmbeds, absolutizeImages };

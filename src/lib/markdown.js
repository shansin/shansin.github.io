import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'isomorphic-dompurify';
import { visit } from 'unist-util-visit';
import { calculateReadingTime } from './utils';

// Remark plugin to convert @[youtube](VIDEO_ID) syntax into embedded iframes.
// Remark's parser turns [youtube](VIDEO_ID) into a link node, so the paragraph
// ends up as: textNode("@") + linkNode(url=VIDEO_ID, text="youtube").
// We detect that pattern and replace the entire paragraph with an HTML embed.
function remarkYouTubeEmbed() {
    return (tree) => {
        visit(tree, 'paragraph', (node, index, parent) => {
            const children = node.children;
            if (!children || children.length < 2) return;

            // Look for pattern: text ending with "@" followed by a link with text "youtube"
            for (let i = 0; i < children.length - 1; i++) {
                const textNode = children[i];
                const linkNode = children[i + 1];

                if (
                    textNode.type !== 'text' ||
                    !textNode.value.endsWith('@') ||
                    linkNode.type !== 'link' ||
                    !linkNode.children ||
                    linkNode.children.length !== 1 ||
                    linkNode.children[0].type !== 'text' ||
                    linkNode.children[0].value !== 'youtube'
                ) {
                    continue;
                }

                // Check that the "@" is the only content in the text node (or preceded only by whitespace)
                const prefix = textNode.value.slice(0, -1).trim();
                if (prefix !== '') continue;

                const videoId = linkNode.url;

                // Check for optional config in a following text node like {width: 80%, aspect-ratio: 4/3}
                let width = '100%';
                let aspectRatio = '16/9';
                let consumeExtra = 0;

                if (i + 2 < children.length && children[i + 2].type === 'text') {
                    const configMatch = children[i + 2].value.match(/^\{([^}]+)\}/);
                    if (configMatch) {
                        consumeExtra = 1;
                        const pairs = configMatch[1].split(',').map(s => s.trim());
                        for (const pair of pairs) {
                            const [key, val] = pair.split(':').map(s => s.trim());
                            if (key === 'width') width = val;
                            if (key === 'aspect-ratio') aspectRatio = val;
                        }
                    }
                }

                const htmlString = `
        <div class="youtube-embed-wrapper" style="aspect-ratio: ${aspectRatio}; width: ${width}; max-width: 100%;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen>
          </iframe>
        </div>
      `;

                // Replace the entire paragraph with the HTML node
                parent.children[index] = {
                    type: 'html',
                    value: htmlString
                };

                return; // Done with this paragraph
            }
        });
    };
}

// Remark plugin to convert ```mermaid code blocks into <div class="mermaid"> elements.
// This prevents rehype-highlight from syntax-highlighting Mermaid source and instead
// outputs a div that the client-side Mermaid renderer can pick up.
function remarkMermaid() {
    return (tree) => {
        visit(tree, 'code', (node, index, parent) => {
            if (node.lang !== 'mermaid') return;

            parent.children[index] = {
                type: 'html',
                value: `<div class="mermaid">${node.value}</div>`,
            };
        });
    };
}

// Remark plugin to convert @[excalidraw](filename) into a <div> with data-scene.
// The filename is resolved relative to content/posts/.
// At build time the .excalidraw JSON is read, base64-encoded, and embedded so
// the client-side ExcalidrawRenderer can decode & render it as SVG.
function remarkExcalidraw() {
    return (tree) => {
        visit(tree, 'paragraph', (node, index, parent) => {
            const children = node.children;
            if (!children || children.length < 2) return;

            // Pattern: textNode("@") + linkNode(text="excalidraw", url=filename)
            const textNode = children[0];
            const linkNode = children[1];

            if (
                textNode.type !== 'text' ||
                !textNode.value.endsWith('@') ||
                linkNode.type !== 'link' ||
                !(linkNode.children?.[0]?.value === 'excalidraw')
            ) {
                return;
            }

            const filename = linkNode.url;
            const filePath = path.join(process.cwd(), 'content', 'posts', filename);

            let sceneB64 = '';
            try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                // Validate it's parseable JSON
                JSON.parse(raw);
                sceneB64 = Buffer.from(raw).toString('base64');
            } catch (err) {
                console.warn(`[remarkExcalidraw] Could not read ${filePath}:`, err.message);
                parent.children[index] = {
                    type: 'html',
                    value: `<p style="color:red">⚠ Excalidraw file not found: ${filename}</p>`,
                };
                return;
            }

            parent.children[index] = {
                type: 'html',
                value: `<div class="excalidraw-diagram" data-scene="${sceneB64}"></div>`,
            };
        });
    };
}

const contentDirectory = path.join(process.cwd(), 'content');

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create a single reusable remark processor instance for better performance
const remarkProcessor = remark()
    .use(remarkYouTubeEmbed)
    .use(remarkMermaid)
    .use(remarkExcalidraw)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true });

// Cache for processed markdown content to improve performance
// Using LRU (Least Recently Used) cache with size limit
const MAX_CACHE_SIZE = 50;
const contentCache = new Map();

// Helper function to manage cache size with LRU eviction
function setCacheEntry(key, value) {
    if (contentCache.size >= MAX_CACHE_SIZE && !contentCache.has(key)) {
        // Delete the oldest entry (first in Map)
        const firstKey = contentCache.keys().next().value;
        contentCache.delete(firstKey);
    }
    contentCache.set(key, value);
}

// Reuses getMarkdownContent but specific for posts
export async function getPostData(id) {
    const cacheKey = `post-${id}`;

    // Check cache first
    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey);
    }

    const fullPath = path.join(contentDirectory, `posts/${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    let content, data;
    try {
        ({ content, data } = matter(fileContents));
    } catch (error) {
        throw new Error(
            `\n\n❌ Frontmatter parsing error in file:\n` +
            `   📄 ${fullPath}\n\n` +
            `   ${error.message}\n`
        );
    }

    const processedContent = await remarkProcessor.process(content);
    const rawHtml = processedContent.toString();

    // Sanitize HTML to prevent XSS attacks
    const contentHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote',
            'code', 'pre',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'hr',
            'span', 'div', 'iframe', 'video', 'source'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'target', 'rel',
            'src', 'alt', 'width', 'height',
            'class', 'id',
            'language', 'className',
            'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy', 'type', 'controls',
            'style', 'data-source', 'data-type', 'data-scene'
        ]
    });

    // Serialize date
    if (data.date && data.date instanceof Date) {
        data.date = data.date.toISOString().split('T')[0];
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    const result = {
        id,
        contentHtml,
        readingTime,
        ...data,
    };

    // Cache the result
    setCacheEntry(cacheKey, result);

    return result;
}

export async function getMarkdownContent(relativePath) {
    const cacheKey = `content-${relativePath}`;

    // Check cache first
    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey);
    }

    const fullPath = path.join(contentDirectory, relativePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    let content, data;
    try {
        ({ content, data } = matter(fileContents));
    } catch (error) {
        throw new Error(
            `\n\n❌ Frontmatter parsing error in file:\n` +
            `   📄 ${fullPath}\n\n` +
            `   ${error.message}\n`
        );
    }

    const processedContent = await remarkProcessor.process(content);
    const rawHtml = processedContent.toString();

    // Sanitize HTML to prevent XSS attacks
    const contentHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote',
            'code', 'pre',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'hr',
            'span', 'div', 'iframe', 'video', 'source'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'target', 'rel',
            'src', 'alt', 'width', 'height',
            'class', 'id',
            'language', 'className',
            'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy', 'type', 'controls',
            'style'
        ]
    });

    const result = {
        contentHtml,
        ...data,
    };

    // Cache the result
    setCacheEntry(cacheKey, result);

    return result;
}

export function getAllPosts() {
    // Ensure the posts directory exists
    const postsDirectory = path.join(contentDirectory, 'posts');
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.filter(fileName => fileName.endsWith('.md')).map((fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        let content, data;
        try {
            ({ content, data } = matter(fileContents));
        } catch (error) {
            throw new Error(
                `\n\n❌ Frontmatter parsing error in file:\n` +
                `   📄 ${fullPath}\n\n` +
                `   ${error.message}\n`
            );
        }
        const excerpt = content.trim().split('\n')[0].substring(0, 160) + (content.length > 160 ? '...' : '');

        // Serialize date if it's a Date object
        if (data.date && data.date instanceof Date) {
            data.date = data.date.toISOString().split('T')[0];
        }

        // Calculate reading time
        const readingTime = calculateReadingTime(content);

        // Automatically add 'draft' tag for draft posts
        let tags = data.tags || [];
        if (data.draft && !tags.includes('draft')) {
            tags = ['draft', ...tags];
        }

        return {
            id,
            excerpt,
            readingTime,
            draft: data.draft || false,
            coverImage: data.coverImage || null,
            ...data,
            tags,
        };
    });

    // Filter out drafts in production
    const filteredPosts = isDev
        ? allPostsData
        : allPostsData.filter(post => !post.draft);

    return filteredPosts.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

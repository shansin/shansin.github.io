import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'isomorphic-dompurify';
import { calculateReadingTime } from './utils';

const contentDirectory = path.join(process.cwd(), 'content');

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create a single reusable remark processor instance for better performance
const remarkProcessor = remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify);

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
            'span', 'div'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'target', 'rel',
            'src', 'alt', 'width', 'height',
            'class', 'id',
            'language', 'className'
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
            'span', 'div'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'target', 'rel',
            'src', 'alt', 'width', 'height',
            'class', 'id',
            'language', 'className'
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

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create a single reusable remark processor instance for better performance
const remarkProcessor = remark().use(html);

// Cache for processed markdown content to improve performance
const contentCache = new Map();

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
    const contentHtml = processedContent.toString();

    // Serialize date
    if (data.date && data.date instanceof Date) {
        data.date = data.date.toISOString().split('T')[0];
    }

    const result = {
        id,
        contentHtml,
        ...data,
    };

    // Cache the result
    contentCache.set(cacheKey, result);

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
    const contentHtml = processedContent.toString();

    const result = {
        contentHtml,
        ...data,
    };

    // Cache the result
    contentCache.set(cacheKey, result);

    return result;
}

export function getAllPosts() {
    // Ensure the posts directory exists
    const postsDirectory = path.join(contentDirectory, 'posts');
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
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

        // Automatically add 'draft' tag for draft posts
        let tags = data.tags || [];
        if (data.draft && !tags.includes('draft')) {
            tags = ['draft', ...tags];
        }

        return {
            id,
            excerpt,
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

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

// Reuses getMarkdownContent but specific for posts
export async function getPostData(id) {
    const fullPath = path.join(contentDirectory, `posts/${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { content, data } = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(content);
    const contentHtml = processedContent.toString();

    // Serialize date
    if (data.date && data.date instanceof Date) {
        data.date = data.date.toISOString().split('T')[0];
    }

    return {
        id,
        contentHtml,
        ...data,
    };
}

export async function getMarkdownContent(relativePath) {
    const fullPath = path.join(contentDirectory, relativePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { content, data } = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(content);
    const contentHtml = processedContent.toString();

    return {
        contentHtml,
        ...data,
    };
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
        const { data } = matter(fileContents);

        // Serialize date if it's a Date object
        if (data.date && data.date instanceof Date) {
            data.date = data.date.toISOString().split('T')[0];
        }

        return {
            id,
            ...data,
        };
    });

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

import { getAllPosts } from '@/lib/markdown';
import { siteConfig } from '@/lib/config';

export const dynamic = 'force-static';

export default async function sitemap() {
  const baseUrl = siteConfig.url;
  
  // Get all posts
  const posts = getAllPosts();
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
  
  // Dynamic post pages
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
  
  return [...staticPages, ...postPages];
}

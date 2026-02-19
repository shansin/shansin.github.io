import { getAllPosts, getPostData } from '@/lib/markdown';

export const dynamic = 'force-static';

export async function GET() {
  const baseUrl = 'https://shsin.github.io';
  const posts = getAllPosts();

  // Get full content for each post
  const postsWithContent = await Promise.all(
    posts.map(async (post) => {
      const postData = await getPostData(post.id);
      return {
        ...post,
        contentHtml: postData.contentHtml,
      };
    })
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Systems and Strides</title>
    <link>${baseUrl}</link>
    <description>Personal blog about AI, engineering and endurance activities.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    <managingEditor>singhshantanu94@gmail.com (Shantanu Singh)</managingEditor>
    <webMaster>singhshantanu94@gmail.com (Shantanu Singh)</webMaster>
    ${postsWithContent.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.id}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator>Shantanu Singh</dc:creator>
      ${post.tags ? post.tags.map(tag => `<category>${tag}</category>`).join('\n      ') : ''}
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <content:encoded><![CDATA[${post.contentHtml || ''}]]></content:encoded>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}

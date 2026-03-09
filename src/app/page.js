import { getMarkdownContent, getAllPosts } from '@/lib/markdown';
import Intro from '@/components/Intro';
import BlogList from '@/components/BlogList';
import Subscribe from '@/components/Subscribe';

export default async function Home() {
  const introData = await getMarkdownContent('intro.md');
  const allPosts = getAllPosts();

  return (
    <main className="container">
      <Intro contentHtml={introData.contentHtml} title={introData.title} tagline={introData.tagline} />
      <BlogList posts={allPosts} />
      <Subscribe />
    </main>
  );
}

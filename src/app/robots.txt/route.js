export const dynamic = 'force-static';

import { siteConfig } from '@/lib/config';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: ${siteConfig.url}/sitemap.xml
Host: ${siteConfig.url}
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

import { SITE } from '@/consts';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const baseUrl = SITE.href.replace(/\/$/, '');
  const projects = await getCollection('projects');

  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/about/`,
    `${baseUrl}/projects/`,
    ...projects.map((project) => `${baseUrl}/projects/${encodeURIComponent(project.data.slug)}/`),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

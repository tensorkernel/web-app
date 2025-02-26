// src/utils/generateSitemap.ts
import { supabase } from '../lib/supabase';

let sitemapCache: string | null = null;

export async function generateSitemap() {
  if (sitemapCache) {
    return sitemapCache;
  }

  const baseUrl = 'https://yourdomain.com'; // Replace with your actual domain

  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('slug');

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('slug');

  if (gamesError || categoriesError) {
    throw new Error('Failed to fetch data for sitemap generation');
  }

  const urls = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/top-games`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/new-releases`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/contact-us`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${baseUrl}/privacy-policy`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${baseUrl}/about-us`, changefreq: 'yearly', priority: '0.3' },
  ];

  games?.forEach((game) => {
    urls.push({
      loc: `${baseUrl}/g/${game.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  categories?.forEach((category) => {
    urls.push({
      loc: `${baseUrl}/category/${category.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
    <url>
      <loc>${url.loc}</loc>
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  sitemapCache = sitemap;
  return sitemap;
}

// Regenerate sitemap every hour
setInterval(async () => {
  sitemapCache = null;
  await generateSitemap();
}, 60 * 60 * 1000);

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Path Resolution ──────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = join(__dirname, '../../public/sitemap.xml');

// Load service account key
const serviceAccountPath = join(__dirname, '../../scripts/serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  console.error('❌ Failed to load serviceAccountKey.json for sitemap generation:', e.message);
  process.exit(1);
}

// ── Initialize Firebase Admin ────────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

const BASE_URL = 'https://med-peptides-app-27a3a.web.app';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/catalog', priority: '0.9', changefreq: 'weekly' },
  { url: '/protocols', priority: '0.9', changefreq: 'weekly' },
  { url: '/objectives', priority: '0.8', changefreq: 'weekly' },
  { url: '/academy', priority: '0.8', changefreq: 'weekly' },
  { url: '/quality', priority: '0.7', changefreq: 'monthly' },
  { url: '/faq', priority: '0.7', changefreq: 'monthly' },
  { url: '/calculator', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.6', changefreq: 'monthly' },
  { url: '/contact', priority: '0.5', changefreq: 'monthly' },
];

async function generateSitemap() {
  console.log('🚀 Generating Dynamic Sitemap via Firebase Admin SDK...');

  try {
    // 1. Fetch Products
    const productsSnap = await db.collection('products').get();
    const products = productsSnap.docs.map(d => {
      const data = d.data();
      return {
        slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-'),
        isActive: data.isActive !== false
      };
    }).filter(p => p.isActive && p.slug);

    // 2. Fetch Protocols
    const protocolsSnap = await db.collection('protocols').get();
    const protocols = protocolsSnap.docs.map(d => ({
      slug: d.id, // Assuming id is the slug
    }));

    // 3. Fetch Blog Posts
    const blogSnap = await db.collection('blogPosts').get();
    const blogPosts = blogSnap.docs.map(d => ({
      slug: d.id,
    }));

    // 4. Fetch Categories
    const categories = [...new Set(productsSnap.docs.map(d => d.data().category))].filter(Boolean);

    // ── XML Construction ──────────────────────────────────────────────────────
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Product Pages
    products.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/product/${p.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Protocol Pages
    protocols.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/protocol/${p.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Blog Pages
    blogPosts.forEach(b => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blog/${b.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Collection Pages
    categories.forEach(cat => {
      const slug = cat.toLowerCase().replace(/\s+/g, '-');
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/collection/${slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    writeFileSync(outputPath, xml);
    console.log(`✅ Sitemap successfully saved to: ${outputPath}`);
    console.log(`📊 Total URLs: ${staticPages.length + products.length + protocols.length + blogPosts.length + categories.length}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(1);
  }
}

generateSitemap();

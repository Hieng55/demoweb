import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'https://webs4v.vn';
const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' });
const TODAY = formatter.format(new Date());

const pages = [
  // Trang chủ
  { path: '/', priority: '1.0', changefreq: 'weekly', comment: 'Trang chủ' },

  // Dịch vụ
  { path: '/dich-vu/', priority: '0.9', changefreq: 'weekly', comment: 'Dịch vụ' },
  { path: '/dich-vu/thiet-ke-website/', priority: '0.9', changefreq: 'weekly' },
  { path: '/dich-vu/seo-google/', priority: '0.9', changefreq: 'weekly' },
  { path: '/dich-vu/google-ads/', priority: '0.8', changefreq: 'weekly' },
  { path: '/dich-vu/meta-ads/', priority: '0.8', changefreq: 'weekly' },
  { path: '/dich-vu/cham-soc-fanpage/', priority: '0.8', changefreq: 'weekly' },
  { path: '/dich-vu/nhan-dien-thuong-hieu/', priority: '0.8', changefreq: 'weekly' },
  { path: '/dich-vu/google-business/', priority: '0.8', changefreq: 'weekly' },

  // Blog & Kiến thức
  { path: '/blog/', priority: '0.9', changefreq: 'weekly', comment: 'Blog & Kiến thức' },
  { path: '/blog/cong-ty-tnhh-cong-nghe-webs4v-vn/', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog/thiet-ke-website-thu-duc/', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog/thiet-ke-website-vung-ven-phia-dong/', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog/thiet-ke-website-hoc-mon/', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog/google-ads-co-click-khong-co-khach/', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog/7-cau-hoi-truoc-khi-lam-website/', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog/chuan-bi-lam-website-ecommerce/', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog/quy-trinh-trien-khai-website-theo-moc-duyet/', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog/responsive-khong-chi-la-thu-nho-giao-dien/', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog/seo-nen-tang-gom-nhung-gi/', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog/website-nha-hang-nen-uu-tien-gi/', priority: '0.8', changefreq: 'monthly' },

  // Thông tin & Liên hệ & Tuyển dụng
  { path: '/ve-chung-toi/', priority: '0.8', changefreq: 'monthly', comment: 'Thông tin & Liên hệ & Tuyển dụng' },
  { path: '/lien-he/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tuyen-dung/', priority: '0.8', changefreq: 'weekly' },
  { path: '/tuyen-dung/website-developer-intern/', priority: '0.8', changefreq: 'weekly' },
  { path: '/tuyen-dung/website-developer-fresher/', priority: '0.8', changefreq: 'weekly' },
  { path: '/tuyen-dung/marketing-executive/', priority: '0.8', changefreq: 'weekly' },
  { path: '/tuyen-dung/sales-website/', priority: '0.8', changefreq: 'weekly' },
  { path: '/chinh-sach-bao-mat/', priority: '0.5', changefreq: 'yearly' },
];

function generateXml(pageList) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const item of pageList) {
    if (item.comment) {
      xml += `\n  <!-- ${item.comment} -->\n`;
    }
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${item.path}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

const sitemapContent = generateXml(pages);

// Write to public/sitemap.xml
writeFileSync(resolve(process.cwd(), 'public/sitemap.xml'), sitemapContent, 'utf8');
console.log(`✓ Updated public/sitemap.xml (${pages.length} URLs, lastmod: ${TODAY})`);

// Write to out/sitemap.xml if out exists
const outDir = resolve(process.cwd(), 'out');
if (existsSync(outDir)) {
  writeFileSync(resolve(outDir, 'sitemap.xml'), sitemapContent, 'utf8');
  console.log(`✓ Updated out/sitemap.xml (${pages.length} URLs, lastmod: ${TODAY})`);
}

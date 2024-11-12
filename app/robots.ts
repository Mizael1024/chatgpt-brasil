export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Googlebot-Image',
        disallow: '/admin/images/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      }
    ],
    sitemap: 'https://chatgptoficial.com/sitemap.xml',
  };
}

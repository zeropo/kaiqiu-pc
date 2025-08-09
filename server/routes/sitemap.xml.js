export default defineEventHandler(() => {
  const urls = [
    '/',
    '/matches',
    '/arenas',
    '/coaches',
    '/umpires',
    '/scores',
    '/rankings',
    '/search'
  ]
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  urls.forEach(u => {
    xml.push(`<url><loc>${u}</loc></url>`)
  })
  xml.push('</urlset>')
  return xml.join('')
})


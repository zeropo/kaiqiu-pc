// Nuxt configuration (JavaScript only, no TypeScript)
export default defineNuxtConfig({
  ssr: true,
  components: [{ path: '~/components', pathPrefix: false }],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],
  css: [
    '@/assets/css/tailwind.css',
    '@/assets/design/tokens.css'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  app: {
    head: {
      titleTemplate: (title) => {
        if (!title) return '开球网（网页版）';
        return `${title} - 开球网（网页版）`;
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '开球网（网页版）：查询比赛、球馆、教练、裁判与积分排行榜，现代化、响应式体验。' },
        { property: 'og:site_name', content: '开球网（网页版）' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  runtimeConfig: {
    kqBaseUrl: process.env.KQ_BASE_URL || 'https://kaiqiuwang.cc/xcx/public/index.php/api',
    public: {
      apiBase: '/api'
    }
  },
  image: {
    domains: ['oss.kaiqiu.cc', 'kaiqiuwang.cc']
  },
  nitro: {
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
    }
  },
  tailwindcss: {
    viewer: false
  }
});


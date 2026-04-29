// Nuxt mutates the loaded config object during startup. Returning a fresh
// object on each load avoids reusing a previously patched config instance.
export default defineNuxtConfig(() => ({
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
      title: '开球网',
      titleTemplate: (titleChunk) => {
        return titleChunk && titleChunk !== '开球网' ? `${titleChunk} - 开球网` : '开球网'
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '开球网（网页版）：查询比赛、球馆、教练、裁判与积分排行榜，现代化、响应式体验。' },
        { property: 'og:site_name', content: '开球网' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  runtimeConfig: {
    kqBaseUrl: process.env.KQ_BASE_URL || 'https://kaiqiuwang.cc/xcx/public/index.php/api',
    kqSilentAuth: {
      account: process.env.KQ_SILENT_LOGIN_ACCOUNT || 'wreyrwy',
      password: process.env.KQ_SILENT_LOGIN_PASSWORD || 'zero2436426',
      openId: process.env.KQ_SILENT_LOGIN_OPEN_ID || 'o9ocC5ZNCoOQeNxlPiXr7fAbB9tU'
    },
    public: {
      apiBase: '/api'
    }
  },
  image: {
    domains: ['oss.kaiqiu.cc', 'kaiqiuwang.cc']
  },
  nitro: {
    routeRules: {
      '/': { swr: 60 },
      '/matches': { swr: 180 },
      '/search': { swr: 120 },
      '/scores': { swr: 180 },
      '/arenas': { swr: 180 },
      '/coaches': { swr: 180 },
      '/umpires': { swr: 180 },
      '/rankings': { swr: 180 },
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
    }
  },
  tailwindcss: {
    viewer: false
  }
}));

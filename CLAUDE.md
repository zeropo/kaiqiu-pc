# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

- `npm install`
- `npm run dev` — 在 3000 端口启动 Nuxt 开发服务器
- `npm run build`
- `npm run preview`
- `npm run start`

当前仓库没有 lint 脚本、test 脚本，也没有项目内测试框架配置，因此暂时没有“运行单个测试”的标准命令。

## 架构概览

- 技术栈：Nuxt 4 + Vue 3 + Tailwind CSS，启用 SSR，且只使用 JavaScript。不要引入 TypeScript。
- 应用外壳：`app.vue` 挂载 `NuxtLayout` / `NuxtPage` 并设置全局字体与 head；`layouts/default.vue` 是主站布局，`layouts/empty.vue` 用于更独立的整页视图。
- 运行时代码之外的两类重要输入：
  - `api/original/**` 与 `api/standard/**` 是开球网接口文档，改代理或字段映射前先看这里。
  - `ui/**` 是小程序截图，用来校验网页端是否保持功能与界面意图一致。
- 前端取数以页面为中心：
  - 多数 `pages/**` 页面直接通过 `const { $api } = useNuxtApp()` 发请求，并在 `onMounted` 中加载数据。
  - `services/**` 存在，但不是唯一的数据访问层；很多页面绕过 service 直接调 `$api`，不要先入为主地把 service 当成唯一抽象。
- API 调用链路是：页面/组件 -> `$api` 插件 -> 本地 `/api/*` Nitro 路由 -> 上游接口。
  - `plugins/api.client.js` 与 `plugins/api.server.js` 注入 `$api`，其基础路径来自 `runtimeConfig.public.apiBase`，默认是 `/api`。
  - POST 请求统一使用 `application/x-www-form-urlencoded`，不是 JSON。
- `server/api/**` 是对开球网上游接口的代理层。
  - `server/api/_utils/request.js` 负责转发 GET 查询参数，以及把 POST body 转成表单编码后再发给上游。
  - `server/api/_utils/form.js` 会把上游返回中 `code !== 1` 的响应视为错误。
  - 上游路径大小写敏感，修改 route/service 时要严格保持原样，例如 `/Top/...`、`/Trainer/detail`。
- `KQ_BASE_URL` 控制上游基础地址；未设置时默认使用 `https://kaiqiuwang.cc/xcx/public/index.php/api`。
- 共享定位状态集中在 `composables/useCity.js`。
  - `city` / `lat` / `lng` 会持久化到 localStorage。
  - 开发环境直接使用杭州默认值。
  - 生产环境只有在没有缓存坐标时才尝试浏览器定位。
  - 比赛、球馆、教练、积分、排行等页面都依赖这份状态。
- 样式以 Tailwind 工具类为主；全局设计 token 分散在 `tailwind.config.js` 与 `assets/design/tokens.css`。
- SEO 是轻量、代码驱动的：
  - 全局 metadata 在 `nuxt.config.js`
  - 页面级 metadata 通过 `useHead(...)`
  - `server/routes/**` 里生成 `robots.txt` 与 `sitemap.xml`

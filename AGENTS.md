# AGENTS.md

本文件为在此仓库中协作的 coding agent 提供统一的项目级说明。请优先遵守这里的项目约束，再结合当前任务做判断。

## 常用命令

- `npm install`
- `npm run dev` - 在 `3000` 端口启动 Nuxt 开发服务器
- `npm run build`
- `npm run preview`
- `npm run start`

当前仓库没有 `lint` 脚本、`test` 脚本，也没有项目内测试框架配置，因此暂时不存在“运行单个测试”的标准命令。

## 验证约定

- 默认不要执行 `npm run build`。
- 只有以下情况才执行 `npm run build`：
  - 用户明确要求做构建验证
  - 改动足够大，涉及多个页面、多个模块或整条数据链路，需要完整编译确认
  - 改动了构建配置、核心运行时配置、依赖或高风险底层基础设施
- 小改动默认不跑构建，包括样式、文案、单页面逻辑调整、接口参数微调、条件渲染修改、轻量交互修改等。
- 不要因为“顺手改了逻辑”就执行构建；是否构建以改动规模和风险为准，不以改动类型为准。

## 技术与边界

- 技术栈是 `Nuxt 4 + Vue 3 + Tailwind CSS`，启用 SSR。
- 只使用 JavaScript，不要引入 TypeScript。
- 这是开球网的小程序网页端移植项目，当前功能边界以“查询”为主；不要擅自扩展到登录、报名等未覆盖能力。

## 架构概览

- `app.vue` 挂载 `NuxtLayout` / `NuxtPage` 并设置全局字体与 head。
- `layouts/default.vue` 是主站布局，`layouts/empty.vue` 用于更独立的整页视图。
- `api/original/**` 与 `api/standard/**` 是开球网接口文档；改代理、字段映射或请求参数前先看这里。
- `ui/**` 是小程序截图；做页面和交互调整时，优先用它来校验功能与界面意图是否仍然一致。

## 数据与接口链路

- 前端取数以页面为中心。
- 多数 `pages/**` 页面直接通过 `const { $api } = useNuxtApp()` 发请求，并在 `onMounted` 中加载数据。
- `services/**` 存在，但不是唯一的数据访问层；很多页面会绕过 service 直接调 `$api`，不要先入为主地把 service 当成唯一抽象。
- API 调用链路是：页面或组件 -> `$api` 插件 -> 本地 `/api/*` Nitro 路由 -> 上游接口。
- `plugins/api.client.js` 与 `plugins/api.server.js` 注入 `$api`，基础路径来自 `runtimeConfig.public.apiBase`，默认是 `/api`。
- POST 请求统一使用 `application/x-www-form-urlencoded`，不是 JSON。

## 服务端代理约束

- `server/api/**` 是对开球网上游接口的代理层。
- `server/api/_utils/request.js` 负责转发 GET 查询参数，以及把 POST body 转成表单编码后再发给上游。
- `server/api/_utils/form.js` 会把上游返回中 `code !== 1` 的响应视为错误。
- 上游路径大小写敏感。修改 route 或 service 时要严格保持原样，例如 `/Top/...`、`/Trainer/detail`。
- `KQ_BASE_URL` 控制上游基础地址；未设置时默认使用 `https://kaiqiuwang.cc/xcx/public/index.php/api`。

## 共享状态

- 共享定位状态集中在 `composables/useCity.js`。
- `city`、`lat`、`lng` 会持久化到 `localStorage`。
- 开发环境直接使用杭州默认值。
- 生产环境只有在没有缓存坐标时才尝试浏览器定位。
- 比赛、球馆、教练、积分、排行等页面都依赖这份状态，修改时注意联动影响。

## 样式与 SEO

- 样式以 Tailwind 工具类为主。
- 全局设计 token 分散在 `tailwind.config.js` 与 `assets/design/tokens.css`。
- SEO 是轻量、代码驱动的：
  - 全局 metadata 在 `nuxt.config.js`
  - 页面级 metadata 通过 `useHead(...)`
  - `server/routes/**` 里生成 `robots.txt` 与 `sitemap.xml`

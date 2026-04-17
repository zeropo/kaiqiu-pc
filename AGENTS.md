# AGENTS.md

本文件为在此仓库中协作的 coding agent 提供统一的项目级说明。优先遵守这里的项目约束，再结合当前任务执行。

## 项目定位

- 这是一个基于 `Nuxt 4 + Vue 3 + Tailwind CSS` 的 SSR 查询站点。
- 当前公开能力以查询为主，包含比赛、球馆、教练、裁判、积分、榜单和搜索页面。
- 不要扩展到前台登录、报名等未覆盖能力。
- 文档与协作说明只覆盖公开查询模块；不要把未公开页面或未公开能力写进项目文档。

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

- 只使用 `JavaScript`，不要引入 `TypeScript`。
- 技术栈是 `Nuxt 4 + Vue 3 + Tailwind CSS`，启用 SSR。
- 运行时代码之外，接口说明主要在 `api/original/**` 与 `api/standard/**`。
- 当前仓库没有独立的 `ui/` 视觉稿目录，不要假设它存在。
- `.nuxt/**` 属于生成产物，不要把它当成业务源码来源。

## 架构概览

- `app.vue` 挂载 `NuxtLayout` / `NuxtPage`，并注入全局字体和顶部 toast 容器。
- `layouts/default.vue` 是主站布局，负责顶部导航、搜索入口、城市切换和页脚；`layouts/empty.vue` 用于更轻量的独立视图。
- `pages/**` 采用页面中心组织方式，公开页面主要按“列表页 + 详情页”拆分。
- `components/` 主要分为：
  - `components/card/`：通用卡片
  - `components/match/`：比赛详情子模块
  - `components/score/`：积分详情展示
  - `components/search/`：搜索页各查询 Tab
  - `components/ui/`：基础 UI 组件
  - `components/common/`：跨页面通用组件，如城市切换器
- `services/**` 是 `$api` 的薄封装，不要先入为主地把它当成唯一数据访问层。

## 数据与接口链路

- API 调用主链路是：页面或组件 -> `$api` 插件 -> 本地 `/api/*` Nitro 路由 -> 上游接口。
- `plugins/api.client.js` 与 `plugins/api.server.js` 注入 `$api`，基础路径来自 `runtimeConfig.public.apiBase`，默认是 `/api`。
- `server/api/**` 是上游接口代理层。
- `server/api/_utils/request.js` 负责：
  - 转发 GET 查询参数
  - 读取并合并 POST body
  - 把 POST body 转成 `application/x-www-form-urlencoded`
  - 在请求上游前补齐鉴权头
- `server/api/_utils/auth.js` 负责服务端静默鉴权、cookie 持久化与鉴权头构造。
- `server/api/_utils/form.js` 会把上游返回中 `code !== 1` 的响应视为错误。
- 上游路径大小写敏感，修改 route 或 service 时要严格保持原样，例如 `/Top/...`、`/Trainer/detail` 这类路径大小写不能改。

## 运行时配置

- `KQ_BASE_URL` 控制上游基础地址。
- `KQ_SILENT_LOGIN_ACCOUNT`、`KQ_SILENT_LOGIN_PASSWORD`、`KQ_SILENT_LOGIN_OPEN_ID` 用于服务端静默鉴权。
- 不要在代码或文档里扩散默认鉴权配置值；只记录变量名即可。
- `public.apiBase` 当前固定为 `/api`。

## 共享状态与页面模式

- 共享定位状态集中在 `composables/useCity.js`。
- `city`、`lat`、`lng`、`cityGroups` 会持久化到 `localStorage`。
- 开发环境直接使用杭州默认值；生产环境只有在没有缓存坐标时才尝试浏览器定位。
- `components/common/GlobalCitySwitcher.vue` 依赖 `useCity()` 做城市切换。
- 列表页普遍会结合 `SegmentTabs`、筛选按钮和 `useAutoLoadMore()` 组织交互。
- 搜索页 `pages/search.vue` 通过 `components/search/**` 组合不同查询类型，而不是拆成多个独立搜索页面。

## 样式与 SEO

- 样式以 Tailwind 工具类为主。
- 全局设计 token 分散在 `tailwind.config.js` 与 `assets/design/tokens.css`。
- 全局 metadata 在 `nuxt.config.js`。
- 页面级 metadata 主要通过 `useHead(...)` 设置。
- `server/routes/robots.txt.js` 与 `server/routes/sitemap.xml.js` 负责输出 SEO 文件。
- `public/**` 存放 favicon、manifest 和公开静态资源。

## 协作提醒

- 修改接口参数、字段映射或代理路径前，先看 `api/standard/**`，必要时再回查 `api/original/**`。
- 页面直接调 `$api` 是当前项目的正常模式，不要为了“看起来更整洁”强行改成统一 service 架构。
- 文档更新时，优先描述真实存在且公开可见的页面、目录和链路，不要把仓库里的内部实现细节写进 README 一类对外文档。

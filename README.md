# kaiqiu-pc

`kaiqiu-pc` 是开球网的网页版查询站点，基于 `Nuxt 4 + Vue 3 + Tailwind CSS` 构建，面向桌面端与移动端浏览器提供统一的乒乓球信息查询体验。

项目当前只覆盖公开查询能力，重点是比赛、球馆、教练、裁判、积分、榜单与全局搜索，不提供用户登录、报名等前台操作。

## 技术栈

- `Nuxt 4` + `Vue 3`
- `JavaScript`（不使用 TypeScript）
- `Tailwind CSS`
- `@nuxt/image`
- `Nitro Server Routes / Server API`
- `Nitro SWR / Event Cache`
- `SSR`

## 主要能力

- 比赛列表与详情查询
- 球馆列表与详情查询
- 教练列表与详情查询
- 裁判列表与详情查询
- 积分列表与选手详情查询
- 榜单列表与详情查询
- 多类型统一搜索
- 首页、比赛大厅与搜索结果首屏 SSR 预取
- 搜索 Tab 间查询参数隔离
- 比赛交战详情内跳转选手积分详情
- 城市切换与定位辅助
- 基础 SEO、`robots.txt`、`sitemap.xml`

## 目录概览

```text
kaiqiu-pc/
├── api/                  # 接口文档，分 original / standard 两套
├── assets/               # 全局样式与设计 token
├── components/           # 页面复用组件，含 card / match / score / search / ui / common
├── composables/          # 共享状态与组合逻辑
├── layouts/              # 默认布局与轻量布局
├── pages/                # 文件路由，按公开查询模块拆分
├── plugins/              # $api 注入与客户端静默鉴权
├── public/               # favicon、manifest 等静态资源
├── server/               # Nitro 服务端代理与 SEO 路由
├── services/             # 对 $api 的轻量封装
├── app.vue               # 应用外壳
├── nuxt.config.js        # Nuxt / runtimeConfig / SEO / image 配置
├── tailwind.config.js    # Tailwind 设计系统配置
├── README.md
└── AGENTS.md
```

### 关键目录说明

- `pages/`：公开页面入口，采用“列表页 + 详情页”的组织方式。
- `components/search/`：搜索页的多 Tab 检索组件。
- `components/card/`、`components/match/`、`components/score/`：卡片、比赛详情、积分详情等核心展示组件。
- `composables/useCity.js`：城市、经纬度、本地缓存与切换版本号的共享状态。
- `composables/useAutoLoadMore.js`：列表页无限滚动加载。
- `plugins/api.client.js`、`plugins/api.server.js`：统一注入 `$api`。
- `server/api/_utils/body.js`：统一读取并缓存 Nitro event body。
- `server/api/_utils/request.js`：服务端请求转发、表单编码与共享 body 读取。
- `server/api/_utils/cache.js`：为热点 POST 列表代理封装 SWR 缓存。
- `server/api/_utils/auth.js`：上游接口静默鉴权、cookie 持久化与服务端短时鉴权复用。
- `server/routes/robots.txt.js`、`server/routes/sitemap.xml.js`：SEO 文件路由。

## 数据链路

项目采用页面驱动的数据获取模式，主链路如下：

`页面 / 组件` -> `$api` 插件 -> 本地 `/api/*` -> `server/api/**` -> 开球网上游接口

补充说明：

- `services/**` 存在，但不是唯一的数据访问层，很多页面会直接调用 `$api`。
- `GET` 请求会转发查询参数。
- `POST` 请求统一使用 `application/x-www-form-urlencoded`，不是 JSON。
- 首页、比赛大厅与搜索页部分结果已改为 `useAsyncData` 首屏预取。
- 热点列表接口已在 Nitro 层按 POST body 做缓存。
- 服务端代理请求上游前会先完成静默鉴权，并把凭证写入 cookie；同时会短时复用鉴权结果，减少重复静默登录。
- 上游路径大小写敏感，本地代理路径需要严格保持原样。

## 当前运行特性

- `pages/index.vue` 与 `pages/matches/index.vue` 由服务端先取首屏数据，客户端定位变化后再刷新同城结果。
- `pages/search.vue` 切换 Tab 时只保留 `tab` 参数，并按 `activeTab` 重新挂载子组件，避免不同搜索类型串参。
- `components/search/**` 在 URL 已带查询参数时可直接服务端出结果，初始化完成后才回写 URL。
- `nuxt.config.js` 已为 `/`、`/matches`、`/search`、`/scores`、`/arenas`、`/coaches`、`/umpires`、`/rankings` 配置 SWR。
- `components/match/MatchGameDetailModal.vue` 顶部对阵选手在存在 `uid` 时可直接跳转到 `/scores/:uid`。

## 运行方式

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

默认启动在 `http://localhost:3000`。

### 生产构建

```bash
npm run build
```

### 本地预览

```bash
npm run preview
```

### 启动生产服务

```bash
npm run start
```

## 环境变量

建议在本地环境或部署平台显式配置以下变量：

- `KQ_BASE_URL`：开球网上游接口基础地址
- `KQ_SILENT_LOGIN_ACCOUNT`：服务端静默鉴权账号
- `KQ_SILENT_LOGIN_PASSWORD`：服务端静默鉴权密码
- `KQ_SILENT_LOGIN_OPEN_ID`：服务端静默鉴权 openId

运行时公开前缀由 `runtimeConfig.public.apiBase` 控制，当前配置为 `/api`。

## 接口文档

仓库内已保留两套接口资料：

- `api/original/**`：原始接口文档，保留上游真实路径与原始字段
- `api/standard/**`：标准化接口文档，更适合对照当前代理实现

调整代理路由、请求参数或字段映射前，建议先看 `api/standard/**`，再回看 `api/original/**`。

## SEO 与静态资源

- 全局站点信息在 `nuxt.config.js`
- 页面级 SEO 主要通过各页面内的 `useHead(...)` 设置
- `server/routes/robots.txt.js` 生成 `robots.txt`
- `server/routes/sitemap.xml.js` 生成站点地图
- `public/**` 保存 favicon、manifest 等静态资源
- `@nuxt/image` 已配置上游图片域名白名单

## 开发补充

- 当前仓库没有 `lint` 脚本，也没有 `test` 脚本。
- 项目以查询体验为中心，页面逻辑通常直接围绕当前页面组织，而不是强制抽成统一 service 层。
- 城市定位相关能力集中在 `composables/useCity.js`，比赛、球馆、教练、积分、榜单等页面都会依赖它。


# Web 中文化补充

为多个英文站点补齐中文界面：补全官方翻译中**未收录、漏翻的英文文案**——导航、按钮、表单、表头、提示、确认弹窗、时间与计数等。

> 本脚本由 AI 编写，词典译文仅供参考。发现错译、漏译欢迎提 Issue 或 PR。

## 支持站点

| 站点 | 域名 | 词条 | 默认行为 |
| --- | --- | --- | --- |
| Greasy Fork / Sleazy Fork | `greasyfork.org` `sleazyfork.org` | 431 | 中文界面下开启，英文界面不干预 |
| SteamDB | `steamdb.info` | 213 | 进站即翻译 |

未适配的域名脚本完全不运行。

## 安装

安装 [Tampermonkey](https://www.tampermonkey.net/)、[Violentmonkey](https://violentmonkey.github.io/) 或 Greasemonkey 后，从 Greasyfork 或本仓库 Release 安装。

## 功能

- **词条替换**：644 条 UI 文案词典，按站点与界面分区组织
- **正则补全**：`3 days ago` → `3 天前`、`1 of 10` → `1 / 10`、`1,234,567 players` → `1,234,567 名玩家`
- **属性翻译**：`placeholder`、`title`、`aria-label`、`alt`、`data-confirm`，以及提交类按钮的 `value`
- **动态内容**：MutationObserver 监听异步加载与局部刷新
- **菜单开关**：一键启用 / 停用，停用后还原原文，无需刷新
- **漏翻发现**：导出本页未翻译的英文文案，输出成可直接粘贴的词典格式

## 安全策略

站点上有大量用户创作内容（脚本标题、游戏名、开发商、评论），脚本对它们一律不改动：

1. 文本节点只有在**整段完全等于**某条英文词条时才替换；
2. 短语级替换只在按钮、表单标签、表头、导航等 UI 元素内进行；
3. `code` / `pre` / `textarea` 与各站点标注的数据区域整体跳过；
4. 相对时间与数量都支持「数字在别的元素里」的形态：`<span>5</span> minutes ago` → `5 分钟前`，且不加整句锚点，嵌在长句里（如 `Game Music 5 minutes ago`）也能命中。

5. 站点用 `<br>` 折行时（`<th>Most Played<br>Games</th>`）会先把折行拼回整句再查词典，避免只译出前半截留下「最热玩 Games」这种半吊子。

6. 数量与单位常被拆在不同元素里（`<span>564k</span> apps in database`），正则的数字部分设为可选，拆分和完整两种形态都能命中。

7. 品牌名与第三方脚本名受保护：站点自有品牌用软保护（`SteamDB is not affiliated with...` 照常翻译，品牌名保留原文）；第三方脚本名用硬保护（`Greasy Fork+` 整段不动）。

## 菜单

| 菜单项 | 作用 |
| --- | --- |
| 切换中文补全开关 | 一键启用 / 停用，停用后自动还原原文 |
| 重新扫描页面 | 对已加载内容重新跑一遍替换 |
| 导出本页未翻译的英文文案（控制台） | 输出漏翻文案，方便补词条 |
| 导出全部英文原文（未过滤） | 用于核对「到底识别到了什么」 |
| 查看替换统计（控制台） | 查看替换了多少处文本与属性 |

导出以「块级祖先」为单位取内联文本：链接嵌在句中不会被切成残片，与块级子元素混排的直接文本也不会整段丢失。断句时句号后必须跟空白或到结尾才切，`v2.0.6`、`github.com` 不会被拆坏。

导出结果分两张表：**建议翻译**与**已过滤**（附过滤原因）。备注列标注「含内联代码」「属性」「单词，可能无需翻译」。

通用噪声（时间戳、数据库变更流水、`By xxx` 署名、序号日期）与各站点的 `dataSelectors` / `dataSkipRe` 会自动过滤，游戏名、开发商等数据不会进入建议列表。

备注列会标注「替换区外（被站点 skipClassRe 排除）」——词典里明明有、页面上却不生效的，多半是命中了 `skipClassRe` 被整块跳过，照着这条排查即可。

## 词典来源

- **SteamDB**：取自官方 Crowdin 项目（`crowdin.com/project/steamdb-extension`）导出的 `_locales/zh_CN/messages.json`。官方页面显示**已翻译 100%、已批准 97%**——翻译全部完成，但约 30 个词仍处「已翻译未批准」状态（含 17 个自动翻译词），因此并非全部经过人工校对，少数词条单列在「存疑待复核」分组
- **Greasy Fork**：对比官方仓库 `config/locales/en.yml` 与 `zh-CN.yml`，补全其中 53 个缺失 key 里页面可见的标题与短语

> Greasy Fork 官方翻译托管在 **Transifex** 而非 Crowdin，因此直接对比仓库语言文件比查 Crowdin 更准确。

各站点的官方进度请以平台显示为准：进度条 100% 指的是「已翻译」，不代表「已批准」。校对入口：Crowdin 项目 → 对应语言 → 筛选 `Translated, not approved`。

## 项目结构

```
src/core/engine.js     # 引擎（站点无关）：采集、替换、观察器、导出
src/sites/*.js         # 各站点词典，registerSite() 注册
tools/build.js         # 合成 dist/Web-Zh-CN-Patch.user.js
```

词典分离、发布单文件——用户安装的仍是一个 `.user.js`。

### 本地构建

```bash
npm run build   # 生成 dist/Web-Zh-CN-Patch.user.js
npm run check   # 只做语法与词典校验
```

### 新增站点

在 `src/sites/` 下新建文件，`registerSite()` 里填 `id`、`name`、`hosts`、`dictGroups` 即可，构建脚本会自动合并 `@match` 与描述。

| 字段 | 说明 |
| --- | --- |
| `defaultEnabled` | 布尔值或函数，决定该站是否默认开启 |
| `protectRe` | 正则，命中的专名不翻译 |
| `protectMode` | `hard`（默认）含专名的整段不动，适用于第三方脚本名；`soft` 只保护专名本身，含专名的句子照常翻译，适用于站点自有品牌 |
| `protectLabel` | 导出时「受保护专名」原因里显示的站名 |
| `dataSelectors` | 选择器，命中则视为数据区，不翻译也不建议 |
| `dataSkipRe` | 正则，命中的文本视为数据噪声 |
| `skipClassRe` | 正则，命中 class 的容器整体跳过。**只写数据内容的专属类名**，切勿写 `table-hover`、`chart` 这类通用词——Bootstrap 表格都带 `table-hover`，图表页容器普遍带 `chart`，写进去会让整页（尤其表头）不翻译 |
| `uiSelectors` | 站内 UI 容器选择器，短语级替换在这些区域内放宽 |
| `phrases` / `rules` | 短语与正则规则 |

## 图标

脚本在油猴管理器列表里显示蓝底「文」字图标。图标以 **data URI 内联**
在 metadata 里，不依赖外网——国内访问 `raw.githubusercontent.com` 时常
不稳定，外链图标容易加载失败。

原图在 `assets/icon.png`（64×64）。上架 Greasyfork 时可在脚本页面上传
同一文件，获得更清晰的展示效果。

## 自动更新

构建产物自带 `@downloadURL` 与 `@updateURL`（指向本仓库 `main` 分支的
`dist/` 目录），Tampermonkey / Violentmonkey 可自动检测更新。

每次打开页面时控制台会打印一行：

```
[Web 中文化补充] v2.1.1 · SteamDB
```

**确认版本请先看这一行**——若显示的版本号低于仓库最新版，说明浏览器
跑的还是旧脚本。可在脚本管理器里点「检查更新」，或手动重装。

> 若改从 Greasyfork 安装，请把两条 URL 换成 Greasyfork 的地址：
> `https://greasyfork.org/scripts/XXXXXX/code/...user.js` 与 `.../meta.js`

## 更彻底的做法

脚本只能做客户端补丁。遇到系统性漏翻，建议同时到官方翻译平台提交译法（Greasy Fork 在 Transifex，SteamDB 在 Crowdin），让所有用户受益。

## 许可

[MIT License](./LICENSE)。

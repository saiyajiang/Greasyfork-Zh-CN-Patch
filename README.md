# Greasyfork 中文化补充

一个用户脚本（Userscript），用于补全 [Greasyfork](https://greasyfork.org)（含 Sleazyfork）中文界面里**未翻译、漏翻的英文文案**：导航、按钮、表单、表头、提示、确认弹窗、时间与计数等。

> 本脚本由 AI 编写，词典译文仅供参考。发现错译、漏译欢迎提 Issue 或 PR。

## 安装

安装 [Tampermonkey](https://www.tampermonkey.net/)、[Violentmonkey](https://violentmonkey.github.io/) 或 Greasemonkey 后：

- 从 Greasyfork 或本仓库 Release 安装，或
- 下载 [`Greasyfork-Zh-CN-Patch.user.js`](./Greasyfork-Zh-CN-Patch.user.js)，把内容直接粘贴进管理器的「新建脚本」。

## 功能

- **词条替换**：约 300 条 UI 文案词典，覆盖导航与账号、列表排序、脚本详情、操作按钮、用户页面、提示状态六大类。
- **正则补全**：`3 days ago` → `3 天前`、`1 of 10` → `1 / 10`、`25 results` → `25 个结果` 等带数字的文案。
- **属性翻译**：搜索框 `placeholder`、`title`、`aria-label`、`alt`，以及 Rails 的 `data-confirm` 确认弹窗（`Are you sure?` → `确定吗？`）。
- **动态内容**：MutationObserver 监听异步加载与局部刷新的内容。
- **菜单开关**：可一键启用或停用，停用时会还原为原文，无需刷新。
- **漏翻发现**：菜单「导出本页未翻译的英文文案」，把页面上仍是英文的 UI 文案输出成可直接粘贴的词典格式，方便扩充词库。

## 安全策略

用户脚本站上有大量**用户创作内容**（脚本标题、简介、代码、评论），脚本对它们一律不改动：

1. 文本节点只有在**整段完全等于**某条英文词条时才替换；
2. 短语级替换只在按钮、表单标签、表头、导航等 UI 元素内进行；
3. `code` / `pre` / `textarea` / 脚本卡片 / 讨论与评论等区域整体跳过；
4. 英文界面（`lang` 非中文）默认不干预，可通过菜单强制开启。

## 使用说明

点击脚本管理器菜单（Tampermonkey 图标）可看到：

| 菜单项 | 作用 |
| --- | --- |
| 切换中文补全开关 | 一键启用 / 停用，停用后自动还原原文 |
| 重新扫描页面 | 对已加载内容重新跑一遍替换 |
| 导出本页未翻译的英文文案（控制台） | 输出漏翻文案，方便补词条 |
| 查看替换统计（控制台） | 查看本次替换了多少处文本与属性 |

## 扩充词典

1. 打开任意 Greasyfork 页面，点击脚本菜单「导出本页未翻译的英文文案（控制台）」；
2. 在控制台（F12）复制输出的 `['英文', '中文译文'],` 片段；
3. 粘到脚本里 `DICT_GROUPS` 对应的分组中，填上译文，改 `@version` 后发布。

## 上架 Greasyfork 后补充

本仓库的 `@source` / `@homepageURL` 已指向 GitHub，但**自动更新需要补两条 metadata**（拿到脚本 ID 后填 XXXXXX）：

```js
// @downloadURL  https://greasyfork.org/scripts/XXXXXX-greasyfork/code/Greasyfork%20.user.js
// @updateURL    https://greasyfork.org/scripts/XXXXXX-greasyfork/meta.js
```

否则用户不会收到更新推送。

## 更彻底的做法

本站翻译由社区在 Crowdin 上维护，脚本只能做客户端补丁。遇到系统性漏翻，建议同时到官方翻译平台提交译法，让所有用户受益；本脚本定位是「官方翻译补齐前的临时补充」。

## 许可

[MIT License](./LICENSE)。

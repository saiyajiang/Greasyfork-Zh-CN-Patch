#!/usr/bin/env node
/**
 * 构建脚本：把 src/core/engine.js 与各站点词典合成单个 .user.js
 *
 *   node tools/build.js            # 生成 dist/Web-Zh-CN-Patch.user.js
 *   node tools/build.js --check    # 只做语法与词典校验，不写文件
 *
 * 词典分离在 src/sites/*.js，用户安装的仍是单文件脚本。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const NAME = 'Web 中文化补充';
const VERSION = readVersion();

function readVersion() {
  const pkg = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkg)) return JSON.parse(fs.readFileSync(pkg, 'utf8')).version;
  return '2.0.0';
}

/* ---------------------------- 元数据 ---------------------------- */

function matchLines(sites) {
  const hosts = new Set();
  sites.forEach(s => s.hosts.forEach(h => hosts.add(h)));
  return Array.from(hosts).map(h => `// @match        https://${h}/*`).join('\n');
}

function siteList(sites) {
  const m = new Map();
  sites.forEach(s => m.set(s.name, s.hosts.join(' / ')));
  return Array.from(m.entries()).map(([n, h]) => `${n}（${h}）`).join('、');
}

function metadata(sites) {
  return `// ==UserScript==
// @name         ${NAME}
// @name:zh-CN   ${NAME}
// @name:en      Web Zh-CN Patch
// @namespace    https://github.com/saiyajiang/Web-Zh-CN-Patch
// @version      ${VERSION}
// @description  为多个英文站点补齐中文界面：目前支持 ${siteList(sites)}。补全官方翻译中未收录、漏翻的英文文案：导航、按钮、表单、表头、提示与确认弹窗等。本脚本由 AI 编写，译文仅供参考，欢迎反馈更地道的译法。
// @description:zh-CN 为多个英文站点补齐中文界面，补全官方翻译中未收录、漏翻的英文文案。本脚本由 AI 编写。
// @description:en  Fills in untranslated English UI strings on multiple sites. Written by AI.
// @author       saiyajiang
// @license      MIT
// @homepageURL  https://github.com/saiyajiang/Web-Zh-CN-Patch
// @supportURL   https://github.com/saiyajiang/Web-Zh-CN-Patch/issues
// @source       https://github.com/saiyajiang/Web-Zh-CN-Patch
${matchLines(sites)}
// @downloadURL  https://raw.githubusercontent.com/saiyajiang/Web-Zh-CN-Patch/main/dist/Web-Zh-CN-Patch.user.js
// @updateURL    https://raw.githubusercontent.com/saiyajiang/Web-Zh-CN-Patch/main/dist/Web-Zh-CN-Patch.meta.js
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==`;
}

/* ---------------------------- 载入站点 ---------------------------- */

function loadSites() {
  const dir = path.join(SRC, 'sites');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  const sites = [];
  const sandbox = {
    registerSite(cfg) {
      if (!cfg || !cfg.id || !cfg.hosts || !cfg.dictGroups) {
        throw new Error('站点配置缺少 id / hosts / dictGroups');
      }
      sites.push(cfg);
    },
    UNIT_MAP: {},
    console
  };
  vm.createContext(sandbox);
  files.forEach(f => {
    const code = fs.readFileSync(path.join(dir, f), 'utf8');
    vm.runInContext(code, sandbox, { filename: f });
  });
  return { files, sites };
}

function countEntries(sites) {
  let n = 0;
  sites.forEach(s => {
    Object.keys(s.dictGroups).forEach(g => { n += s.dictGroups[g].length; });
  });
  return n;
}

/* ---------------------------- 主流程 ---------------------------- */

const { files, sites } = loadSites();

console.log('载入站点配置 ' + files.length + ' 个：');
sites.forEach(s => {
  const n = Object.keys(s.dictGroups).reduce((a, g) => a + s.dictGroups[g].length, 0);
  console.log('   ' + s.id.padEnd(14) + s.hosts.join(', ').padEnd(34) + n + ' 条词条');
});
console.log('词条合计 ' + countEntries(sites) + ' 条');

// 校验：站点 id 与 hosts 不得重复
const ids = new Set(), hostSeen = new Map();
sites.forEach(s => {
  if (ids.has(s.id)) throw new Error('站点 id 重复: ' + s.id);
  ids.add(s.id);
  s.hosts.forEach(h => {
    if (hostSeen.has(h)) throw new Error('域名重复: ' + h + ' (' + hostSeen.get(h) + ' 与 ' + s.id + ')');
    hostSeen.set(h, s.id);
  });
});

const engine = fs.readFileSync(path.join(SRC, 'core', 'engine.js'), 'utf8');

const banner = `
/*
 * ${NAME}
 * ------------------------------------------------------------------
 * 覆盖站点：${siteList(sites)}
 *
 * 安全策略（不改动站点的用户内容，如脚本标题、游戏名、评论）：
 *   1. 文本节点只在「整段完全等于」某条英文词条时才替换；
 *   2. 短语级替换只在按钮 / 表单标签 / 表头 / 导航等 UI 元素内进行；
 *   3. code / pre / textarea 与站点标注的数据区域整体跳过；
 *   4. 各站点可自行设定默认是否启用，随时可在菜单切换。
 *
 * 菜单项：
 *   切换中文补全开关 / 重新扫描页面 / 导出本页未翻译的英文文案 /
 *   导出全部英文原文（未过滤）/ 查看替换统计
 *
 * 本脚本由 AI 编写，词典译文仅供参考。
 * 仓库：https://github.com/saiyajiang/Web-Zh-CN-Patch
 */
`;

const boot = `
  const site = pickSite();
  if (!site) {
    console.log('[${NAME}] v${VERSION} 当前站点未适配：' + location.hostname);
    return;
  }
  console.log('%c[${NAME}] v${VERSION} · ' + site.name, 'font-weight:bold');
  boot(site);
`;

const out = [
  metadata(sites),
  banner,
  '\n(function () {\n  \'use strict\';\n',
  engine,
  files.map(f => '\n  /* ===== 站点词典：' + f + ' ===== */\n' +
    fs.readFileSync(path.join(SRC, 'sites', f), 'utf8')).join('\n'),
  boot,
  '})();\n'
].join('\n');

// 语法校验
new vm.Script(out, { filename: 'Web-Zh-CN-Patch.user.js' });
console.log('语法校验通过');

if (process.argv.includes('--check')) {
  console.log('仅校验，未写入文件');
  process.exit(0);
}

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
const target = path.join(DIST, 'Web-Zh-CN-Patch.user.js');
fs.writeFileSync(target, out, 'utf8');
console.log('已生成 ' + path.relative(ROOT, target) + ' (' + out.length + ' 字节)');

// 仅含元数据的轻量文件，Tampermonkey 检查更新时不必下载整个脚本
const metaTarget = path.join(DIST, 'Web-Zh-CN-Patch.meta.js');
fs.writeFileSync(metaTarget, metadata(sites) + '\n', 'utf8');
console.log('已生成 ' + path.relative(ROOT, metaTarget));

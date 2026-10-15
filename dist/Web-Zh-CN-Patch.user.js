// ==UserScript==
// @name         Web 中文化补充
// @name:zh-CN   Web 中文化补充
// @name:en      Web Zh-CN Patch
// @namespace    https://github.com/saiyajiang/Web-Zh-CN-Patch
// @version      2.4.0
// @description  为多个英文站点补齐中文界面：目前支持 Greasy Fork（greasyfork.org / sleazyfork.org）、SteamDB（steamdb.info）。补全官方翻译中未收录、漏翻的英文文案：导航、按钮、表单、表头、提示与确认弹窗等。本脚本由 AI 编写，译文仅供参考，欢迎反馈更地道的译法。
// @description:zh-CN 为多个英文站点补齐中文界面，补全官方翻译中未收录、漏翻的英文文案。本脚本由 AI 编写。
// @description:en  Fills in untranslated English UI strings on multiple sites. Written by AI.
// @author       saiyajiang
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAA/1BMVEUyh+gkdds8kvApfeH8/f5Cl/MdbtYccdoAAABeou+Gtu7S5PmmyvQNcex+sOw8ku4A//8gctpOpP0gcto9kvA7kO5Cmvh/f/8AVaoAf388lPJVVapDmPl///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkN7wHAAAAQHRSTlP+/v7+//7++gD4////Ff8rAaAWVaLHnwIDAlQDVwIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT7jHdwAAAiNJREFUeNqll+e2qyAQhUfHkW5JPfX9X/PQYozXGwT2j4Qg+5tCcC2AO02fnJuZ9QfFZsP55+St4D7szzPr8TgAe3b2tgAwNjpinyVEm4UJADtokGULG0+A4O+bbPWBAMZYf1MkSzAGPvhc6LeEmX8APxf7LeHMYWI1ADaBaapkYMYaP87A6gAMEpudRMB7u2BVAFKd6GsAqus6qAAwsgDNKjJg2hISbdgCNmfWFqE2UwkASTEsksKloIVcT70H+KTfSm0B+KIDgFcDbgAopJNLXK41OLAfiQQAH73T/bpzvVy6mQKAFXMpgB9GoUOyMEwAQiF+/+G5yP2lxO7iXQCgdt16Anxv92PBrkIKy0OEbqngoFzNagH4nhBmAVwKwxKzW+OOp/AoIpypXAAtUf1QZ/rBb0RsnMruQJDzDRi+ZYHfZ94J71dQIr8TnfN3UCaU8QgTlBJ8eHcqyuyk4jtElAFWLyddUMSgQvCYhs60i5UtZiIzCpHqpfZIO1oIxYhq+LcdOpkFyUfn5S61U4lmiF27fxIRqW7K/ycaskj2Qb9pFQ3q2Ha2WdPbVW2bR26d5SloNxPvnzpkWyWAax3gCpc6wAXGOsAI05XK7XSdgH/VAL44fPNLMYEu/BvMfWwLCdSOdwP8l49URCAardlePE+BQFkK/lO4+lrCTdi5DDuRuHl/uHzfOf8RJI4D7OIfb4sAPtlL8Ol2mCBuNrYJ1/8/AysrOqwnxKcAAAAASUVORK5CYII=
// @homepageURL  https://github.com/saiyajiang/Web-Zh-CN-Patch
// @supportURL   https://github.com/saiyajiang/Web-Zh-CN-Patch/issues
// @source       https://github.com/saiyajiang/Web-Zh-CN-Patch
// @match        https://greasyfork.org/*
// @match        https://sleazyfork.org/*
// @match        https://steamdb.info/*
// @downloadURL  https://raw.githubusercontent.com/saiyajiang/Web-Zh-CN-Patch/main/dist/Web-Zh-CN-Patch.user.js
// @updateURL    https://raw.githubusercontent.com/saiyajiang/Web-Zh-CN-Patch/main/dist/Web-Zh-CN-Patch.meta.js
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==

/*
 * Web 中文化补充
 * ------------------------------------------------------------------
 * 覆盖站点：Greasy Fork（greasyfork.org / sleazyfork.org）、SteamDB（steamdb.info）
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


(function () {
  'use strict';

  /* ==================================================================
   * 核心引擎（站点无关）
   * ------------------------------------------------------------------
   * 各站点的词典由 src/sites/*.js 通过 registerSite() 注册，
   * 引擎按当前域名挑选站点后启动。
   * ================================================================== */

  const SITES = [];

  function registerSite(cfg) {
    SITES.push(cfg);
  }

  /* 时间单位：各站点词典的 rules 可直接引用 */
  const UNIT_MAP = {
    second: '秒', minute: '分钟', hour: '小时',
    day: '天', week: '周', month: '个月', year: '年'
  };

  function pickSite() {
    const host = location.hostname.toLowerCase();
    let hit = null;
    for (let i = 0; i < SITES.length; i++) {
      const s = SITES[i];
      for (let j = 0; j < s.hosts.length; j++) {
        const h = s.hosts[j].toLowerCase();
        if (host === h || host.endsWith('.' + h)) { hit = s; break; }
      }
      if (hit) break;
    }
    return hit;
  }

  function boot(site) {
  /* ============================ 配置 ============================ */

  const SITE = site;
  const STORE_KEY = 'webzh_' + SITE.id + '_enabled';
  const MAX_TEXT_LEN = SITE.maxTextLen || 120; // 超过此长度的文本节点不做短语替换
  const LOG_PREFIX = '[Web 中文化补充 · ' + SITE.name + ']';

  /* ============================ 基础设施 ============================ */

  /* 译文中为 null 的词条属于「白名单」：不参与替换，仅用于导出时过滤噪声 */
  const EXACT = new Map();
  const SKIP_WORDS = new Set();
  Object.keys(SITE.dictGroups).forEach(function (group) {
    SITE.dictGroups[group].forEach(function (pair) {
      const key = String(pair[0]).toLowerCase();
      if (pair[1] === null) {
        SKIP_WORDS.add(key);
        return;
      }
      if (!EXACT.has(key)) EXACT.set(key, pair[1]);
    });
  });

  /* 硬保护：文本中一旦出现带「+」的 Greasy Fork+（Davide 的独立脚本），
     整段不做任何改动，避免被当作 'Greasy Fork' 拆开或被短语规则局部命中。
     注意只匹配带 + 的形式，否则会误伤含站名的正常句子（如 Webhook 提示句）。 */
  const PROTECT_RE = new RegExp(SITE.protectRe || '$^', 'i');
  /* hard（默认）：含受保护专名的整段一律不动，适用于第三方脚本名这类
     必须整体保留的文本（如 Greasy Fork+）。
     soft：品牌名只保证自身不被译，含品牌名的句子照常翻译
     （如 'SteamDB is not affiliated with...'），适用于站点自己的品牌。 */
  const PROTECT_HARD = (SITE.protectMode || 'hard') === 'hard';

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'TITLE',
    'SVG', 'MATH', 'TEMPLATE', 'IFRAME', 'CANVAS', 'XMP', 'PLAINTEXT'
  ]);

  /* 这些区域属于用户内容 / 代码，整体跳过 */
  const SKIP_CLASS_RE = new RegExp(SITE.skipClassRe || '$^', 'i');

  /* 允许做短语级替换的 UI 元素 */
  const UI_TAGS = new Set([
    'BUTTON', 'LABEL', 'LEGEND', 'OPTION', 'OPTGROUP', 'TH', 'SUMMARY',
    'CAPTION', 'FIGCAPTION', 'DT', 'INPUT'
  ]);
  const UI_CLASS_RE = new RegExp(SITE.uiClassRe || '(?:^|[\\s_-])(btn|button|nav|menu|tab|pill|badge|chip|label|toolbar|actions|pagination|notice|alert|flash|tooltip|dialog|modal|header|footer|sidebar|search|sort|filter|form-group|field)(?:[\\s_-]|$)', 'i');

  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-confirm'];

  const seen = new WeakSet();
  const records = [];
  let stats = { text: 0, attr: 0 };
  let enabled = true;
  let observer = null;
  let timer = null;

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalize(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  function shouldEnableByDefault() {
    if (typeof SITE.defaultEnabled === 'function') return SITE.defaultEnabled();
    return SITE.defaultEnabled !== false;
  }

  function isSkipped(el) {
    let node = el;
    let depth = 0;
    while (node && node.nodeType === 1 && depth < 8) {
      if (SKIP_TAGS.has(node.tagName)) return true;
      const cls = typeof node.className === 'string' ? node.className : '';
      if (cls && SKIP_CLASS_RE.test(cls)) return true;
      node = node.parentElement;
      depth++;
    }
    return false;
  }

  function isUIElement(el) {
    if (!el || el.nodeType !== 1) return false;
    if (UI_TAGS.has(el.tagName)) return true;
    const cls = typeof el.className === 'string' ? el.className : '';
    if (cls && UI_CLASS_RE.test(cls)) return true;
    const inChrome = el.closest && el.closest('nav, footer, header, aside, form, [role="navigation"], [role="banner"]');
    if (inChrome) return true;
    if (SITE.uiSelectors && el.closest && el.closest(SITE.uiSelectors)) return true;
    return false;
  }

  /* 精确匹配（忽略大小写 + 首尾空白与冒号） */
  function lookupExact(t) {
    const k = t.toLowerCase();
    if (EXACT.has(k)) return EXACT.get(k);
    const stripped = t
      .replace(/^[\s:：·•>\-–—]+/, '')
      .replace(/[\s:：·•<\-–—]+$/, '')
      .toLowerCase();
    if (stripped && stripped !== k && EXACT.has(stripped)) return EXACT.get(stripped);
    return null;
  }

  function applyPhrases(t) {
    let out = t;
    let changed = false;
    const PH = SITE.phrases || [];
    for (let i = 0; i < PH.length; i++) {
      const re = new RegExp('\\b' + escapeRegExp(PH[i][0]) + '\\b', 'gi');
      if (re.test(out)) {
        out = out.replace(re, PH[i][1]);
        changed = true;
      }
    }
    return changed ? out : null;
  }

  function applyRules(t, uiOnly) {
    const RL = SITE.rules || [];
    for (let i = 0; i < RL.length; i++) {
      const rule = RL[i];
      if (!!rule.uiOnly !== !!uiOnly) continue;
      const m = t.match(rule.re);
      if (!m) continue;
      if (typeof rule.rep === 'function') return t.replace(rule.re, rule.rep);
      return t.replace(rule.re, rule.rep);
    }
    return null;
  }

  function translate(t, ui) {
    if (!t) return null;

    // 硬保护：含受保护专名的文本一律不动，避免被拆开或局部替换
    if (PROTECT_HARD && PROTECT_RE.test(t)) return null;

    let r = applyRules(t, false);
    if (r !== null) return r;

    const exact = lookupExact(t);
    if (exact !== null) return exact;

    if (ui && t.length <= MAX_TEXT_LEN) {
      r = applyRules(t, true);
      if (r !== null) return r;
      r = applyPhrases(t);
      if (r !== null) return r;
    }
    return null;
  }

  /* 保留原文首尾空白，只替换中间部分 */
  function wrapPreserve(raw, translated) {
    const lead = raw.match(/^\s*/)[0];
    const tail = raw.match(/\s*$/)[0];
    const core = raw.slice(lead.length, raw.length - tail.length);
    const tCore = normalize(core);
    if (core === tCore) return lead + translated + tail;
    return lead + core.replace(tCore, translated) + tail;
  }

  function setText(node, next) {
    records.push({ node: node, before: node.nodeValue });
    node.nodeValue = next;
    stats.text++;
  }

  function handleTextNode(node) {
    if (seen.has(node)) return;
    seen.add(node);
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    const parent = node.parentElement;
    if (!parent || !document.body.contains(parent)) return;
    if (isSkipped(parent)) return;

    const t = normalize(raw);
    if (!t) return;

    const ui = isUIElement(parent);
    const next = translate(t, ui);
    if (next !== null && next !== t) {
      setText(node, wrapPreserve(raw, next));
    }
  }

  function translateAttr(el, name) {
    if (!el.hasAttribute(name)) return;
    const raw = el.getAttribute(name);
    if (!raw || !raw.trim()) return;
    const t = normalize(raw);
    const next = translate(t, true);
    if (next !== null && next !== t) {
      records.push({ el: el, attr: name, before: raw });
      el.setAttribute(name, next);
      stats.attr++;
    }
  }

  function handleElement(el) {
    if (seen.has(el)) return;
    seen.add(el);

    // 代码 / 可编辑区域：只翻译 placeholder，绝不改动内容
    if (el.tagName === 'TEXTAREA' || el.tagName === 'CODE' || el.tagName === 'PRE') {
      translateAttr(el, 'placeholder');
      return;
    }
    if (isSkipped(el)) return;

    // 属性文案
    for (let i = 0; i < ATTRS.length; i++) translateAttr(el, ATTRS[i]);

    // 提交类按钮的 value
    if (el.tagName === 'INPUT') {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'submit' || type === 'button' || type === 'reset') {
        const raw = el.value;
        if (raw && raw.trim()) {
          const t = normalize(raw);
          const next = translate(t, true);
          if (next !== null && next !== t) {
            records.push({ el: el, attr: 'value', before: raw });
            el.value = next;
            stats.attr++;
          }
        }
      }
    }
  }

  function scan(root) {
    if (!enabled) return;
    const scope = root || document.body;
    if (!scope) return;

    if (scope.nodeType === 3) {
      handleTextNode(scope);
      return;
    }

    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === 3) handleTextNode(node);
      else if (node.nodeType === 1) handleElement(node);
      node = walker.nextNode();
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      scan(document.body);
    }, 150);
  }

  function startObserver() {
    if (observer || typeof MutationObserver === 'undefined') return;
    observer = new MutationObserver(function (mutations) {
      if (!enabled) return;
      let dirty = false;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'characterData') dirty = true;
        if (m.addedNodes && m.addedNodes.length) {
          for (let j = 0; j < m.addedNodes.length; j++) {
            const n = m.addedNodes[j];
            if (n.nodeType === 1 || n.nodeType === 3) dirty = true;
          }
        }
      }
      if (dirty) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function restore() {
    for (let i = records.length - 1; i >= 0; i--) {
      const rec = records[i];
      try {
        if (rec.attr) rec.el.setAttribute(rec.attr, rec.before);
        else if (rec.node) rec.node.nodeValue = rec.before;
      } catch (e) { /* 节点已被移除，忽略 */ }
    }
    records.length = 0;
  }

  function setEnabled(next) {
    enabled = !!next;
    try { localStorage.setItem(STORE_KEY, enabled ? '1' : '0'); } catch (e) { /* 忽略 */ }
    if (enabled) {
      scan(document.body);
      startObserver();
    } else {
      stopObserver();
      restore();
    }
    toast(enabled ? '已开启中文补全' : '已关闭中文补全');
  }

  /* --------- 未翻译文案发现：便于扩充词典 --------- */

  const CJK_RE = /[\u4e00-\u9fff\u3040-\u30ff]/;
  /* 纯 URL / 文件路径，不含可译的自然语言 */
  const PURE_NOISE_RE = /^(?:https?:\/\/|[a-z]:\\|\/[\w.-]+)+[\w\/.:@#?&=%-]*$/i;
  /* 占位符：YourRepoName、YourNumericalProjectID 这类大驼峰连写 */
  const PLACEHOLDER_RE = /^(?:[A-Z][a-z\d]+){2,}$/;
  /* 疑似用户名 / 仓库名：含数字、下划线、点或连字符的无空格小写词 */
  const IDENTIFIER_RE = /^[a-z][a-z\d._-]*[\d._-][a-z\d._-]*$/;
  /* 被标签切断的残片：只认括号，句点与冒号都是正常句尾 */
  const FRAGMENT_RE = /^\s*[\(\[]|[\)\]]$/;
  /* 块级元素：不并入父级上下文 */
  const BLOCK_TAGS_RE = /^(?:P|DIV|LI|TD|TH|DT|DD|SECTION|ARTICLE|UL|OL|TABLE|TR|H[1-6]|BLOCKQUOTE|PRE|FIGURE|FORM|NAV|HEADER|FOOTER|ASIDE|MAIN|LABEL|BUTTON|FIELDSET|LEGEND|SUMMARY|OPTION|FIGCAPTION|CAPTION|ADDRESS)$/;
  /* 导航类容器：内部都是链接，合并成一条会失去语义，需逐个拆出 */
  const NOT_TERMINAL_RE = /^(?:NAV|HEADER|FOOTER|ASIDE)$/;
  /* 代码与输入区：整体排除 */
  const DROP_TAGS_RE = /^(?:CODE|PRE|SCRIPT|STYLE|TEXTAREA|SELECT|NOSCRIPT|TITLE)$/;

  /* 导出模式的跳过判定：只排除真正的代码 / 输入区与本脚本注入物。
     替换用的 isSkipped 会连带排除 markdown、user-content 等容器，
     而说明文档正文恰好长在这些容器里，导出沿用会整页漏报。 */
  function isExportSkipped(el) {
    let node = el;
    let depth = 0;
    while (node && node.nodeType === 1 && depth < 8) {
      if (DROP_TAGS_RE.test(node.tagName)) return true;
      const cls = typeof node.className === 'string' ? node.className : '';
      if (cls && /(webzh-toast|ace|codemirror)/i.test(cls)) return true;
      if (node.hasAttribute && node.hasAttribute('data-webzh')) return true;
      node = node.parentElement;
      depth++;
    }
    return false;
  }

  /* 包裹该元素的最近块级祖先：<a> 里的一句话应归到它所在的 <p> */
  function blockAncestor(el) {
    let n = el;
    while (n && n !== document.body && n.parentElement) {
      if (BLOCK_TAGS_RE.test(n.tagName)) return n;
      n = n.parentElement;
    }
    return el.parentElement || el;
  }

  /* 元素的「内联文本」：并入文本节点与非块级子元素，跳过块级子元素与
     code/pre。这样 <p>Enter the <code>x</code> URL.</p> 拿到的是完整
     句子，而不是被内联代码切成两截残片。 */
  function inlineText(el) {
    const parts = [];
    for (let c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { parts.push(c.nodeValue); continue; }
      if (c.nodeType !== 1) continue;
      const tag = c.tagName;
      if (DROP_TAGS_RE.test(tag) || BLOCK_TAGS_RE.test(tag)) continue;
      parts.push(c.innerText || c.textContent || '');
    }
    return normalize(parts.join(' '));
  }

  function splitSentences(text) {
    // 逐字符扫描：句号 / 叹号 / 问号后必须跟空白或到结尾才断句，
    // 否则 v2.0.6、github.com 这类会被拆得面目全非
    const rough = [];
    let buf = '';
    const flush = function () {
      const s = normalize(buf);
      if (s) rough.push(s);
      buf = '';
    };
    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      buf += ch;
      if (ch === '\n' || ch === ';' || ch === '；') { flush(); continue; }
      if (ch === '.' || ch === '!' || ch === '?') {
        const next = text.charAt(i + 1);
        if (next === '' || /\s/.test(next)) flush();
      }
    }
    flush();

    const out = [];
    rough.forEach(function (s) {
      // 超长片段再按逗号切，避免整段落成为一条无法翻译的巨条目
      if (s.length > 160) {
        s.split(/,\s*/).forEach(function (c) {
          const cc = normalize(c);
          if (cc) out.push(cc);
        });
      } else {
        out.push(s);
      }
    });
    return out;
  }

  /* 采集页面英文：文本以「块级祖先」为单位，另含属性文案 */
  function gatherEnglish() {
    const out = [];
    const done = new Set();

    // 逐个文本节点向上找块级祖先，保证文字不会被内联标签切碎，
    // 也不会因为父容器混有块级子元素而整段丢失
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      const parent = node.parentElement;
      if (!parent || isExportSkipped(parent)) continue;
      let host = blockAncestor(parent);
      if (host === document.body) host = parent;
      if (done.has(host)) continue;
      done.add(host);

      // 导航类容器里全是链接，整块合并会变成 "Home Scripts" 这种无意义条目
      if (NOT_TERMINAL_RE.test(host.tagName) && host.children.length) {
        for (let c = 0; c < host.children.length; c++) {
          const child = host.children[c];
          if (isExportSkipped(child)) continue;
          const ct = inlineText(child);
          if (!ct || !/[A-Za-z]{2,}/.test(ct)) continue;
          out.push({ text: ct, ui: true, inline: false, host: child });
        }
        continue;
      }

      // 站点标注的数据区（游戏名、开发商等）不翻译，导出时仅作记录
      if (SITE.dataSelectors && host.closest && host.closest(SITE.dataSelectors)) continue;

      const text = inlineText(host);
      if (!text || !/[A-Za-z]{2,}/.test(text)) continue;
      out.push({
        text: text,
        ui: isUIElement(host),
        inline: !!(host.querySelector && host.querySelector('code, pre')),
        host: host
      });
    }

    // 属性文案：placeholder / title / aria-label / data-confirm
    const attrEls = document.body.querySelectorAll('*');
    for (let i = 0; i < attrEls.length; i++) {
      const el = attrEls[i];
      if (isExportSkipped(el)) continue;
      for (let k = 0; k < ATTRS.length; k++) {
        const name = ATTRS[k];
        if (!el.hasAttribute(name)) continue;
        const v = normalize(el.getAttribute(name));
        if (!v || !/[A-Za-z]{2,}/.test(v)) continue;
        out.push({ text: v, ui: true, inline: false, attr: name });
      }
      // 提交 / 按钮类输入框的 value 也是界面文案
      if (el.tagName === 'INPUT') {
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (type === 'submit' || type === 'button' || type === 'reset') {
          const val = normalize(el.value || '');
          if (val && /[A-Za-z]{2,}/.test(val)) {
            out.push({ text: val, ui: true, inline: false, attr: 'value' });
          }
        }
      }
    }
    return out;
  }

  function flatten(items) {
    const rows = [];
    items.forEach(function (it) {
      splitSentences(it.text).forEach(function (s) {
        rows.push({ text: s, ui: it.ui, inline: it.inline, attr: it.attr, host: it.host });
      });
    });
    return rows;
  }

  /* 通用数据噪声：时间戳、数据库变更流水、署名等，各站点通用 */
  const TIMESTAMP_RE = /^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s+at\s+\d{2}:\d{2}:\d{2}/;
  const DBLOG_RE = /^\d{5,}\s+(?:New|Update|Delete)\b/;
  const BYLINE_RE = /^By\s+[A-Za-z0-9]/;
  const ORDINAL_DATE_RE = /^(?:Ends|Starts|Until)\s+\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+/;

  function classify(t) {
    if (CJK_RE.test(t)) return '已含中文（多半已翻译）';
    // 软保护下含品牌名的句子照常列入建议，译文里保留品牌名即可
    if (PROTECT_HARD && PROTECT_RE.test(t)) {
      return '受保护专名（' + (SITE.protectLabel || SITE.name) + '）';
    }
    if (SKIP_WORDS.has(t.toLowerCase())) return '专名/占位符（白名单）';
    if (PLACEHOLDER_RE.test(t)) return '占位符';
    if (FRAGMENT_RE.test(t.trim())) return '句子残片（被标签切断）';
    if (PURE_NOISE_RE.test(t)) return '纯 URL/路径';
    if (IDENTIFIER_RE.test(t)) return '疑似用户名/标识符';
    if (TIMESTAMP_RE.test(t)) return '时间戳';
    if (DBLOG_RE.test(t)) return '数据库变更流水';
    if (BYLINE_RE.test(t)) return '发行商/作者署名';
    if (ORDINAL_DATE_RE.test(t)) return '日期（可由正则处理）';
    if (SITE.dataSkipRe && new RegExp(SITE.dataSkipRe, 'i').test(t)) {
      return '站点数据区（' + SITE.name + '）';
    }
    return null;
  }

  function note(r) {
    const n = [];
    if (r.attr) n.push('属性（' + r.attr + '）');
    if (r.inline) n.push('含内联代码，原文可能不完整');
    if (!/\s/.test(r.text)) n.push('单词，可能无需翻译');
    return n.join('；');
  }

  /* 词典里明明有、页面上却不生效，多半是命中了 skipClassRe 被整块跳过。
     导出时标出来，免得对着「已能翻译」的假象反复排查。 */
  function blockedNote(host) {
    if (!host || host.nodeType !== 1) return '';
    return isSkipped(host) ? '；替换区外（被站点 skipClassRe 排除）' : '';
  }

  function fmtList(list) {
    return list.map(function (e) {
      return "      ['" + e.replace(/'/g, "\\'") + "', '中文译文'],";
    }).join('\n');
  }

  function copy(text) {
    try {
      if (typeof GM_setClipboard === 'function') { GM_setClipboard(text); return true; }
    } catch (e) { /* 忽略 */ }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* 忽略 */ }
    return false;
  }

  function collectUntranslated() {
    const todo = new Map();
    const skipped = new Map();

    flatten(gatherEnglish()).forEach(function (r) {
      const t = r.text;
      if (t.length < 2 || t.length > 300) return;
      if (!/[A-Za-z]{2,}/.test(t)) return;
      const hasWord = t.split(/\s+/).some(function (w) {
        return /^[A-Za-z][A-Za-z'’-]{1,}$/.test(w) && w.length > 2;
      });
      if (!hasWord) return;
      // 与替换逻辑一致地判断是否已覆盖，避免含已知短语却不在
      // UI 元素内的长词被误判为「已翻译」而漏报
      if (translate(t, r.ui) !== null) return;
      const why = classify(t);
      if (why) {
        const prev = skipped.get(t);
        skipped.set(t, { why: why, count: (prev ? prev.count : 0) + 1 });
      } else {
        const prev = todo.get(t);
        todo.set(t, { count: (prev ? prev.count : 0) + 1, note: note(r) + blockedNote(r.host) });
      }
    });

    const todoList = Array.from(todo.entries());
    const skipList = Array.from(skipped.entries());

    console.log(
      '%c' + LOG_PREFIX + ' 建议翻译 ' + todoList.length + ' 条' +
      (skipList.length ? '，已过滤 ' + skipList.length + ' 条' : ''),
      'font-weight:bold'
    );
    if (todoList.length) {
      console.table(todoList.map(function (e) {
        return { 英文原文: e[0], 出现次数: e[1].count, 备注: e[1].note };
      }));
      const snippet = fmtList(todoList.map(function (e) { return e[0]; }));
      console.log('%c可直接粘贴到词典的格式：\n' + snippet, 'color:#888');
      if (copy(snippet)) toast('已输出 ' + todoList.length + ' 条并复制到剪贴板');
      else toast('已输出 ' + todoList.length + ' 条候选，请查看控制台（F12）');
    } else {
      toast('本页未发现新的英文文案');
    }
    if (skipList.length) {
      console.log('%c以下未列入建议（附过滤原因）：', 'color:#999');
      console.table(skipList.map(function (e) {
        return { 英文原文: e[0], 原因: e[1].why, 出现次数: e[1].count };
      }));
    }
    return todoList;
  }

  /* 不过滤的原始清单：用来确认「到底识别到了什么」 */
  function dumpAllEnglish() {
    const seen = new Set();
    const list = [];
    flatten(gatherEnglish()).forEach(function (r) {
      const t = r.text;
      if (t.length < 2 || !/[A-Za-z]{2,}/.test(t)) return;
      if (seen.has(t)) return;
      seen.add(t);
      list.push(t);
    });
    console.log(
      '%c' + LOG_PREFIX + ' 页面全部英文原文（未过滤）' + list.length + ' 条：',
      'font-weight:bold'
    );
    console.log(list.join('\n'));
    const snippet = fmtList(list);
    console.log('%c粘贴格式：\n' + snippet, 'color:#888');
    if (copy(snippet)) toast('已复制全部 ' + list.length + ' 条英文原文');
    else toast('已输出全部 ' + list.length + ' 条，请查看控制台（F12）');
    return list;
  }

  /* --------- 轻量提示条 --------- */

  function toast(msg) {
    try {
      const box = document.createElement('div');
      box.textContent = msg;
      box.setAttribute('data-webzh', '1');
      box.setAttribute('style', [
        'position:fixed', 'right:16px', 'bottom:16px', 'z-index:2147483647',
        'background:rgba(0,0,0,.82)', 'color:#fff', 'padding:8px 14px',
        'border-radius:6px', 'font:13px/1.5 system-ui,sans-serif',
        'box-shadow:0 4px 14px rgba(0,0,0,.3)', 'transition:opacity .3s'
      ].join(';'));
      document.body.appendChild(box);
      setTimeout(function () {
        box.style.opacity = '0';
        setTimeout(function () { box.remove(); }, 350);
      }, 1800);
    } catch (e) { /* 忽略 */ }
  }

  /* ============================ 启动 ============================ */

  function init() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      // 中文界面默认开启；英文界面默认不干预，用户可在菜单里强制开启
      enabled = saved === null ? shouldEnableByDefault() : saved !== '0';
    } catch (e) {
      enabled = shouldEnableByDefault();
    }

    if (!enabled) {
      console.log(LOG_PREFIX + ' 当前未启用，可在脚本菜单中开启。');
    }

    if (enabled) {
      scan(document.body);
      startObserver();
    }

    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('切换中文补全开关', function () { setEnabled(!enabled); });
      GM_registerMenuCommand('重新扫描页面', function () {
        records.length = 0;
        scan(document.body);
        toast('已重新扫描，替换 ' + (stats.text + stats.attr) + ' 处');
      });
      GM_registerMenuCommand('导出本页未翻译的英文文案（控制台）', collectUntranslated);
      GM_registerMenuCommand('导出全部英文原文（未过滤，便于核对）', dumpAllEnglish);
      GM_registerMenuCommand('查看替换统计（控制台）', function () {
        console.log(LOG_PREFIX, { 站点: SITE.name, 文本: stats.text, 属性: stats.attr, 词典规模: EXACT.size });
        toast('文本 ' + stats.text + ' 处，属性 ' + stats.attr + ' 处');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  }



  /* ===== 站点词典：greasyfork.js ===== */
/* ==================================================================
 * Greasy Fork / Sleazy Fork 词典
 * ------------------------------------------------------------------
 * 词条格式：[英文原文, 中文译文]
 *   译文为 null 表示白名单：不翻译，仅用于导出时过滤噪声
 * 想补充词条，直接往对应分组里加一行即可。
 * ================================================================== */

registerSite({
  id: 'greasyfork',
  name: 'Greasy Fork',
  hosts: ['greasyfork.org', 'sleazyfork.org'],

  /* 中文界面下才默认开启（英文站用户多半就想看英文） */
  defaultEnabled: function () {
    if (/^\/zh(-CN|-TW|-HK)?(\/|$)/i.test(location.pathname)) return true;
    const lang = document.documentElement.lang || '';
    return /^zh\b/i.test(lang);
  },

  /* 'Greasy Fork+' 是另一名作者的独立脚本，与本站无关，必须整体保留 */
  protectRe: '(?:greasy\\s*fork|greasyfork)\\s*\\+',

  /* 用户创作内容区域：脚本标题、简介、评论区等一律不改动 */
  skipClassRe: 'script-link|script-name|script-card|script-list|script-details|script-description|discussion|comment|highlight|code|ace|codemirror|markdown|user-content|breadcrumb|library-list',

  /* ============================ 词典 ============================
   * 格式：[英文原文, 中文译文]，匹配时忽略大小写、忽略首尾空白。
   * 想补充词条，直接往对应分组里加一行即可。
   * ============================================================== */

    dictGroups: {
    '导航与账号': [
      ['Home', '首页'],
      ['Scripts', '脚本'],
      ['Libraries', '库'],
      ['Library', '库'],
      ['Suites', '套件'],
      ['Suite', '套件'],
      ['Users', '用户'],
      ['User', '用户'],
      ['Forums', '论坛'],
      ['Forum', '论坛'],
      ['Help', '帮助'],
      ['Search', '搜索'],
      ['Advanced search', '高级搜索'],
      ['Browse', '浏览'],
      ['Random', '随机'],
      ['Random script', '随机脚本'],
      ['Trending', '热门'],
      ['Popular', '热门'],
      ['Submit a script', '提交脚本'],
      ['My scripts', '我的脚本'],
      ['My account', '我的账户'],
      ['Account', '账户'],
      ['Dashboard', '控制面板'],
      ['Settings', '设置'],
      ['Preferences', '偏好设置'],
      ['Profile', '个人资料'],
      ['Inbox', '收件箱'],
      ['Messages', '私信'],
      ['Message', '私信'],
      ['Notifications', '通知'],
      ['Moderation', '审核管理'],
      ['Moderator', '审核员'],
      ['Admin', '管理员'],
      ['Administration', '管理后台'],
      ['Log in', '登录'],
      ['Login', '登录'],
      ['Sign in', '登录'],
      ['Log out', '退出登录'],
      ['Logout', '退出登录'],
      ['Sign out', '退出登录'],
      ['Register', '注册'],
      ['Sign up', '注册'],
      ['Create account', '创建账号'],
      ['Forgot password?', '忘记密码？'],
      ['Remember me', '记住我'],
      ['Password', '密码'],
      ['Email', '邮箱'],
      ['Username', '用户名'],
      ['Username or email', '用户名或邮箱'],
      ['Confirm password', '确认密码'],
      ['Current password', '当前密码'],
      ['New password', '新密码'],
      ['Donate', '捐赠'],
      ['About', '关于'],
      ['Contact', '联系我们'],
      ['Contact us', '联系我们'],
      ['Terms of service', '服务条款'],
      ['Terms', '条款'],
      ['Privacy policy', '隐私政策'],
      ['Privacy', '隐私'],
      ['Blog', '博客'],
      ['Status', '状态'],
      ['FAQ', '常见问题'],
      ['Help translate', '帮助翻译'],
      ['Feedback', '反馈'],
      ['Report a bug', '反馈问题'],
      ['Changelog', '更新日志']
    ],

    '列表与排序': [
      ['Sort by', '排序方式'],
      ['Sort', '排序'],
      ['Relevance', '相关度'],
      ['Most installs', '安装量最多'],
      ['Most daily installs', '每日安装最多'],
      ['Recently updated', '最近更新'],
      ['Recently added', '最近添加'],
      ['Newest', '最新'],
      ['Oldest', '最早'],
      ['Rating', '评分'],
      ['Ratings', '评分'],
      ['Installs', '安装量'],
      ['Daily installs', '每日安装量'],
      ['Total installs', '总安装量'],
      ['Total', '总计'],
      ['Average', '平均'],
      ['Name', '名称'],
      ['Title', '标题'],
      ['Date', '日期'],
      ['Time', '时间'],
      ['Created', '创建时间'],
      ['Updated', '更新于'],
      ['Last updated', '最后更新'],
      ['Published', '发布时间'],
      ['Filter', '筛选'],
      ['Filters', '筛选条件'],
      ['Apply', '应用'],
      ['Reset', '重置'],
      ['Clear', '清除'],
      ['Clear all', '全部清除'],
      ['Any', '任意'],
      ['All', '全部'],
      ['None', '无'],
      ['Yes', '是'],
      ['No', '否'],
      ['Next', '下一页'],
      ['Previous', '上一页'],
      ['Next page', '下一页'],
      ['Previous page', '上一页'],
      ['First', '第一页'],
      ['Last', '最后一页'],
      ['More', '更多'],
      ['Show more', '显示更多'],
      ['Show less', '显示更少'],
      ['Load more', '加载更多'],
      ['Expand', '展开'],
      ['Collapse', '折叠'],
      ['Read more', '阅读更多'],
      ['Go', '前往']
    ],

    '脚本详情': [
      ['Version', '版本'],
      ['Versions', '版本'],
      ['Author', '作者'],
      ['Authors', '作者'],
      ['License', '许可证'],
      ['Description', '简介'],
      ['Additional info', '附加信息'],
      ['Compatibility', '兼容性'],
      ['Applies to', '适用于'],
      ['History', '历史'],
      ['Diff', '差异对比'],
      ['Compare', '对比'],
      ['Source code', '源代码'],
      ['View source', '查看源码'],
      ['Raw', '原始文件'],
      ['Download', '下载'],
      ['Stats', '统计'],
      ['Statistics', '统计'],
      ['Discussions', '讨论'],
      ['Discussion', '讨论'],
      ['New discussion', '发起讨论'],
      ['Comments', '评论'],
      ['Comment', '评论'],
      ['Reply', '回复'],
      ['Replies', '回复'],
      ['Quote', '引用'],
      ['Derivatives', '衍生脚本'],
      ['Translations', '翻译版本'],
      ['Localization', '本地化'],
      ['Translators', '译者'],
      ['Contributors', '贡献者'],
      ['Credits', '鸣谢'],
      ['Script type', '脚本类型'],
      ['Script set', '脚本集'],
      ['Script sets', '脚本集'],
      ['This script is a library', '此脚本为库'],
      ['Sensitive', '敏感内容'],
      ['Adult content', '成人内容'],
      ['Adult', '成人内容'],
      ['Contains adult content', '含成人内容'],
      ['Requirements', '要求'],
      ['Dependencies', '依赖'],
      ['Includes', '匹配网址'],
      ['Excludes', '排除网址'],
      ['Matches', '匹配网址'],
      ['Category', '分类'],
      ['Categories', '分类'],
      ['Tags', '标签'],
      ['Tag', '标签'],
      ['Site', '站点'],
      ['Sites', '站点'],
      ['Code', '代码'],
      ['Upload', '上传'],
      ['Import', '导入'],
      ['Export', '导出']
    ],

    '操作按钮': [
      ['Install', '安装'],
      ['Update', '更新'],
      ['Installed', '已安装'],
      ['Uninstall', '卸载'],
      ['Reinstall', '重新安装'],
      ['Update available', '有可用更新'],
      ['Install this script', '安装此脚本'],
      ['Install this script?', '安装此脚本？'],
      ['How to install', '如何安装'],
      ['Installation instructions', '安装说明'],
      ['Edit', '编辑'],
      ['Delete', '删除'],
      ['Remove', '移除'],
      ['Save', '保存'],
      ['Save changes', '保存更改'],
      ['Cancel', '取消'],
      ['Confirm', '确认'],
      ['Close', '关闭'],
      ['Back', '返回'],
      ['Submit', '提交'],
      ['Preview', '预览'],
      ['Publish', '发布'],
      ['Unpublish', '取消发布'],
      ['Fork', '复刻'],
      ['Watch', '关注'],
      ['Unwatch', '取消关注'],
      ['Watching', '关注中'],
      ['Follow', '关注'],
      ['Unfollow', '取消关注'],
      ['Favorite', '收藏'],
      ['Unfavorite', '取消收藏'],
      ['Favorites', '收藏夹'],
      ['Add to favorites', '加入收藏'],
      ['Share', '分享'],
      ['Copy', '复制'],
      ['Copy link', '复制链接'],
      ['Copied', '已复制'],
      ['Copied!', '已复制！'],
      ['Send', '发送'],
      ['Send message', '发送私信'],
      ['Report', '举报'],
      ['Report script', '举报脚本'],
      ['Report user', '举报用户'],
      ['Report abuse', '举报滥用'],
      ['Flag', '标记'],
      ['Ban', '封禁'],
      ['Unban', '解封'],
      ['Approve', '通过'],
      ['Reject', '驳回'],
      ['Pending', '待处理'],
      ['Resolved', '已处理'],
      ['Reopen', '重新开启'],
      ['Lock', '锁定'],
      ['Unlock', '解锁'],
      ['Sticky', '置顶'],
      ['Unsticky', '取消置顶'],
      ['Mark as read', '标为已读'],
      ['Mark all as read', '全部标为已读'],
      ['Subscribe', '订阅'],
      ['Unsubscribe', '取消订阅'],
      ['Add', '添加'],
      ['Create', '创建'],
      ['New', '新建'],
      ['Undo', '撤销'],
      ['Redo', '重做'],
      ['Retry', '重试'],
      ['Refresh', '刷新'],
      ['Try again', '请重试'],
      ['Select all', '全选'],
      ['Deselect all', '取消全选'],
      ['Select file', '选择文件'],
      ['Choose file', '选择文件'],
      ['No file chosen', '未选择文件'],
      ['Drop files here', '将文件拖到此处']
    ],

    '用户页面': [
      ['Joined', '注册于'],
      ['Last seen', '最后活跃'],
      ['Level', '等级'],
      ['Badges', '徽章'],
      ['Reputation', '声望'],
      ['Threads', '主题'],
      ['Posts', '帖子'],
      ['Activity', '动态'],
      ['Followers', '关注者'],
      ['Following', '关注中'],
      ['Online', '在线'],
      ['Offline', '离线'],
      ['Banned', '已封禁']
    ],

    '提示与状态': [
      ['Loading', '加载中'],
      ['Loading...', '加载中…'],
      ['Please wait', '请稍候'],
      ['Error', '错误'],
      ['An error occurred', '发生错误'],
      ['Something went wrong', '出现错误'],
      ['Warning', '警告'],
      ['Notice', '提示'],
      ['Success', '成功'],
      ['Info', '信息'],
      ['Tip', '小提示'],
      ['Note:', '注意：'],
      ['Note', '备注'],
      ['Notes', '备注'],
      ['Reason', '原因'],
      ['Optional', '可选'],
      ['Required', '必填'],
      ['Public', '公开'],
      ['Private', '私有'],
      ['Unlisted', '不公开列出'],
      ['Draft', '草稿'],
      ['Type', '类型'],
      ['Unknown', '未知'],
      ['N/A', '不适用'],
      ['Empty', '空'],
      ['No results', '无结果'],
      ['No results found', '未找到结果'],
      ['Nothing found', '未找到内容'],
      ['Nothing here yet', '暂无内容'],
      ['Not found', '未找到'],
      ['Page not found', '页面不存在'],
      ['Access denied', '拒绝访问'],
      ['Forbidden', '禁止访问'],
      ['Permission denied', '权限不足'],
      ['Are you sure?', '确定吗？'],
      ['Are you sure you want to delete this?', '确定要删除吗？'],
      ['This action cannot be undone', '此操作无法撤销'],
      ['Sign in to continue', '登录后继续'],
      ['You must be logged in', '请先登录'],
      ['Saved', '已保存'],
      ['Deleted', '已删除'],
      ['Enabled', '已启用'],
      ['Disabled', '已停用'],
      ['Enable', '启用'],
      ['Disable', '停用'],
      ['On', '开'],
      ['Off', '关'],
      ['Show', '显示'],
      ['Hide', '隐藏'],
      ['General', '常规'],
      ['Details', '详情'],
      ['Overview', '概览'],
      ['Summary', '摘要'],
      ['Options', '选项'],
      ['Advanced', '高级'],
      ['Basic', '基本'],
      ['Default', '默认'],
      ['Custom', '自定义'],
      ['Other', '其他'],
      ['Others', '其他'],
      ['Actions', '操作'],
      ['Action', '操作'],
      ['Language', '语言'],
      ['Characters remaining', '剩余字符数'],
      ['and', '和'],
      ['or', '或']
    ],

    '脚本集与 Webhook': [
      ['Webhooks', 'Webhook'],
      ['Webhook', 'Webhook'],
      ['New webhook', '新建 Webhook'],
      ['Add webhook', '添加 Webhook'],
      ['Edit webhook', '编辑 Webhook'],
      ['Payload URL', '回调地址'],
      ['Content type', '内容类型'],
      ['Secret', '密钥'],
      ['Secret Token', '密钥令牌'],
      ['Which events would you like to trigger this webhook?', '希望哪些事件触发此 Webhook？'],
      ['Which events would you like to use?', '希望使用哪些事件？'],
      ['Triggers', '触发器'],
      ['Trigger', '触发器'],
      ['Repository push', '仓库推送'],
      ['Skip certificate verification', '跳过证书验证'],
      ['Enable SSL Verification', '启用 SSL 验证'],
      ['Enable request history collection', '启用请求历史收集'],
      ['Enable SSL verification', '启用 SSL 验证'],
      ['Events', '事件'],
      ['Active', '启用中'],
      ['Inactive', '已停用'],
      ['Deliveries', '投递记录'],
      ['Recent deliveries', '最近投递'],
      ['Request history', '请求历史'],
      ['Sync', '同步'],
      ['Sync now', '立即同步'],
      ['Last synced', '上次同步'],
      ['Auto-update', '自动更新'],
      ['Automatic updates', '自动更新'],
      ['Help us translate!', '帮助我们翻译！'],
      ['Help translate', '帮助翻译']
    ],

    /* 整句：完整句子不受「仅 UI 元素」限制，靠整体精确匹配保证安全。
       导出的候选里若有长句，放这里并给出完整译文。 */
    '整句': [
      ['To update Greasy Fork on all pushes, choose "Push events".',
       '若要在每次推送时更新 Greasy Fork，请选择“推送事件”。'],
      ['Enable SSL Verification, then enter the data below:',
       '启用 SSL 验证，然后填写以下信息：'],
      ['Enter the data below:', '填写以下信息：'],
      ['This will replace the existing version.', '此操作将覆盖现有版本。'],
      ['You have unsaved changes.', '有未保存的更改。']
    ],

    '语言名称': [
      ['English (en)', '英语（en）'],
      ['Chinese (zh-CN)', '简体中文（zh-CN）'],
      ['Chinese (zh-TW)', '繁体中文（zh-TW）'],
      ['Japanese (ja)', '日语（ja）'],
      ['Korean (ko)', '韩语（ko）'],
      ['German (de)', '德语（de）'],
      ['French (fr)', '法语（fr）'],
      ['Spanish (es)', '西班牙语（es）'],
      ['Portuguese (pt-BR)', '葡萄牙语（巴西）（pt-BR）'],
      ['Russian (ru)', '俄语（ru）'],
      ['Italian (it)', '意大利语（it）'],
      ['Dutch (nl)', '荷兰语（nl）'],
      ['Polish (pl)', '波兰语（pl）'],
      ['Turkish (tr)', '土耳其语（tr）'],
      ['Vietnamese (vi)', '越南语（vi）'],
      ['Filipino (fil)', '菲律宾语（fil）'],
      ['Indonesian (id)', '印尼语（id）'],
      ['Thai (th)', '泰语（th）'],
      ['Arabic (ar)', '阿拉伯语（ar）'],
      ['Hebrew (he)', '希伯来语（he）'],
      ['Hindi (hi)', '印地语（hi）'],
      ['Ukrainian (uk)', '乌克兰语（uk）'],
      ['Czech (cs)', '捷克语（cs）'],
      ['Swedish (sv)', '瑞典语（sv）'],
      ['Danish (da)', '丹麦语（da）'],
      ['Finnish (fi)', '芬兰语（fi）'],
      ['Norwegian (no)', '挪威语（no）'],
      ['Greek (el)', '希腊语（el）'],
      ['Romanian (ro)', '罗马尼亚语（ro）'],
      ['Hungarian (hu)', '匈牙利语（hu）']
    ],

    /* 专有名词 / 占位符 / 第三方脚本名：明确不翻译，仅用于导出时过滤噪声
       注意：'Greasy Fork+' 是另一名作者（Davide）的独立用户脚本，与本站无关，
       务必作为整体保留，不可拆成 'Greasy Fork' 后单独翻译。 */
    '不翻译（白名单）': [
      ['Greasy Fork+', null],
      ['Greasy Fork', null],
      ['Greasyfork+', null],
      ['Greasyfork', null],
      ['Sleazy Fork', null],
      ['Sleazyfork', null],
      ['GitHub', null],
      ['GitLab', null],
      ['Bitbucket', null],
      ['Codeberg', null],
      ['master', null],
      ['main', null],
      ['Tampermonkey', null],
      ['Violentmonkey', null],
      ['Greasemonkey', null],
      ['FireMonkey', null],
      ['OpenUserJS', null],
      ['YourRepoName', null],
      ['YourProjectName', null],
      ['YourBranchName', null],
      ['YourNumericalProjectID', null],
      ['YourUserName', null]
    ],

    /* 官方简体中文语言包尚未收录的文案
       来源：对比 greasyfork-org/greasyfork 仓库 config/locales/en.yml 与
       zh-CN.yml 得出，共 53 个 key 缺失。这里收录其中页面可见的标题与
       短语；纯复数形式（.one）与邮件模板因中文无对应形态，未收录。 */
    '官方译文缺失补全': [
      // 帮助页 / 隐私政策的小标题（页面 <h2>、<h3>）
      ['Server logs', '服务器日志'],
      ['Script statistics', '脚本统计'],
      ['Cookies (when not logged in)', 'Cookie（未登录时）'],
      ['User accounts', '用户账户'],
      ['External logins', '外部登录'],
      ['Data retention', '数据保留'],
      ['Third party libraries', '第三方库'],
      ['JSON API', 'JSON API'],
      ['Prefilled updates', '预填更新'],
      ['Webhook notifications', 'Webhook 通知'],
      // 短语
      ['Add as library', '作为库添加'],
      ['IP Geolocation by DB-IP', 'IP 归属地由 DB-IP 提供'],
      ['Help with Violentmonkey', '帮助使用 Violentmonkey'],
      ['no additional software required', '无需额外软件'],
      ['Conversation with', '与'],
      ['an incorrect subresource integrity hash', '错误的子资源完整性校验值'],
      ['must be the same language as the reported script', '必须与所举报脚本的语言一致'],
      ['Taking too long to load', '加载时间过长'],
      ['This script has had', '此脚本曾有']
    ]
    },

    /* 短语级替换：只在 button / label / 表头 / 导航等 UI 元素内生效 */
    phrases: [
    ['Sort by', '排序方式'],
    ['Search scripts', '搜索脚本'],
    ['Search users', '搜索用户'],
    ['Search forums', '搜索论坛'],
    ['Installs per day', '每日安装量'],
    ['Total installs', '总安装量'],
    ['Daily installs', '每日安装量'],
    ['Last updated', '最后更新'],
    ['Created by', '创建者'],
    ['Updated by', '更新者'],
    ['Show more', '显示更多'],
    ['Read more', '阅读更多'],
    ['Load more', '加载更多'],
    ['Mark all as read', '全部标为已读'],
    ['Add to favorites', '加入收藏'],
    ['Remove from favorites', '取消收藏'],
    ['Send message', '发送私信'],
    ['Report script', '举报脚本'],
    ['How to install', '如何安装'],
    ['Script updated', '脚本已更新'],
    ['Script created', '脚本已创建'],
    ['No scripts found', '未找到脚本'],
    ['No discussions found', '未找到讨论'],
    ['No comments yet', '暂无评论'],
    ['Log in to', '登录后'],
    ['Sign in to', '登录后'],
    ['Are you sure', '确定吗'],
    ['Page not found', '页面不存在'],
    ['Delete this script', '删除此脚本'],
    ['Report this script', '举报此脚本'],
    ['Posted by', '发布者'],
    ['Updated at', '更新于'],
    ['Created at', '创建于'],
    ['then enter the data below', '然后填写以下信息'],
    ['Push events', '推送事件'],
    ['Release events', '发布事件'],
    ['Enable SSL verification', '启用 SSL 验证'],
    ['Help us translate', '帮助我们翻译']
    ],

    /* 正则规则：处理带数字 / 变量的文案 */
    rules: [
    { re: /^just now$/i, rep: '刚刚' },
    { re: /^less than a (?:minute|second) ago$/i, rep: '刚刚' },
    {
      re: /\b(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/i,
      rep: (_m, n, unit) => n + ' ' + UNIT_MAP[unit.toLowerCase().replace(/s$/, '')] + '前'
    },
    {
      re: /^in\s+(\d+)\s+(second|minute|hour|day|week|month|year)s?$/i,
      rep: (_m, n, unit) => n + ' ' + UNIT_MAP[unit.toLowerCase().replace(/s$/, '')] + '后'
    },
    { re: /^(\d+)\s+of\s+(\d+)$/, rep: '$1 / $2' },
    { re: /^(\d+)\s+results?$/i, rep: '$1 个结果' },
    { re: /^(\d+)\s+scripts?$/i, rep: '$1 个脚本' },
    { re: /^(\d+)\s+installs?$/i, rep: '$1 次安装' },
    { re: /^(\d+)\s+comments?$/i, rep: '$1 条评论' },
    { re: /^(\d+)\s+ratings?$/i, rep: '$1 个评分' },
    { re: /^(\d+)\s+new\s+(?:messages?|notifications?)$/i, rep: '$1 条新消息' },
    { re: /^by\s+(\S.{0,38})$/i, rep: '作者：$1', uiOnly: true }
  ]
  });


  /* ===== 站点词典：steamdb.js ===== */
/* ==================================================================
 * SteamDB 词典
 * ------------------------------------------------------------------
 * 词条来源：
 *   1. 官方 Crowdin 项目（crowdin.com/project/steamdb-extension）导出的
 *      _locales/zh_CN/messages.json。
 *      注意：官方页面显示「已翻译 100%、已批准 97%」——翻译全部完成，
 *      但仍有约 30 个词处于「已翻译未批准」状态（含 17 个自动翻译词），
 *      因此这里并非全部经过人工校对，遇到不通顺的请反馈。
 *      校对入口：crowdin.com/project/steamdb-extension → 简体中文 →
 *      筛选 Translated, not approved
 *   2. 少量高置信度通用界面词，单列在「通用界面（待验证）」分组。
 *
 * 补充新词：菜单「导出本页未翻译的英文文案」，把输出粘到对应分组即可。
 * ================================================================== */

const SDB_MONTH = {
  january: '1', february: '2', march: '3', april: '4', may: '5', june: '6',
  july: '7', august: '8', september: '9', october: '10', november: '11', december: '12'
};

const SDB_WORD = {
  apps: '应用', packages: '包', bundles: '捆绑包', releases: '新发售', games: '游戏'
};

registerSite({
  id: 'steamdb',
  name: 'SteamDB',
  hosts: ['steamdb.info'],

  /* SteamDB 无官方中文界面，进站即翻译 */
  defaultEnabled: true,

  /* 品牌名：自身不翻译，但含品牌名的句子照常翻译（软保护） */
  protectRe: 'steamdb',
  protectMode: 'soft',
  protectLabel: 'SteamDB',

  /* 注意：这里只列「数据内容」的专属类名，绝不能写 table-hover、chart
     这类通用词 —— Bootstrap 表格一律带 table-hover，/charts/ 页面容器
     普遍带 chart，写进去会导致整页（尤其是表头）被整块跳过不翻译。
     表头靠 UI_TAGS（TH）判定为界面元素，游戏名因不在词典里天然安全。 */
  skipClassRe: 'app-name|game-name|app-title|package-name|developer|publisher|highcharts-container|code',

  /* 数据区：内部文本视为数据，不翻译也不建议翻译 */
  dataSelectors: '.app-name, .game-name, .app-title, .home-game, .highcharts-container, [class*="leaderboard"]',

  /* 文本级的数据噪声：数据库流水、署名等 */
  dataSkipRe: '^(?:\\d{5,}\\s+(?:New|Update|Delete)\\b|By\\s+[A-Za-z0-9])',

  /* 站内特有的 UI 容器选择器 */
  uiSelectors: '.header-menu, .footer, .tabnav, .page-header, .sidebar, .pagination, .btn-group, .btn',

  dictGroups: {
    '官方译文（Crowdin，100% 已翻译 / 97% 已批准）': [
      ['Search', '搜索'],
      ['Date', '日期'],
      ['Updated', '最近更新于'],
      ['Last Update:', '最近更新日期：'],
      ['Charts', '在线人数'],
      ['Sales', '特卖'],
      ['Calendar', '发行日历'],
      ['Patches', '补丁说明'],
      ['Calculator', '账号价值计算器'],
      ['Options', '设置'],
      ['Inventory', '库存'],
      ['Trade Offers', '交易报价'],
      ['Achievements', '成就'],
      ['Personal achievements', '个人成就'],
      ['Enhancements', '增强功能'],
      ['Explanation', '说明'],
      ['Store Page', '商店页面'],
      ['In Library', '在库中'],
      ['Online Stats', '在线状态统计'],
      ['Online now:', '实时在线人数：'],
      ['24-hour peak:', '24小时峰值人数：'],
      ['All-time peak:', '历史峰值人数：'],
      ['Followers:', '关注数：'],
      ['SteamDB Rating:', 'SteamDB 好评率：'],
      ['Sort by time', '按解锁时间顺序'],
      ['No badge crafted', '徽章未合成'],
      ['Reveal spoilers', '显示隐藏文本'],
      ['Open in Desktop App', '在桌面应用中打开'],
      ['View on SteamDB', '在 SteamDB 上查看'],
      ['View on Steam Hunters', '在 Steam Hunters 上查看'],
      ['View on PCGamingWiki', '在 PCGamingWiki 上查看'],
      ['Steam appears to be experiencing some downtime.', 'Steam 似乎出现了一些故障。']
    ],

    /* SteamDB 首页与主导航：整站通用，取自实际页面导出 */
    '导航与页脚': [
      ['Skip to content', '跳到主要内容'],
      ['Menu', '菜单'],
      ['Close', '关闭'],
      ['Close ×', '关闭 ×'],
      ['Support us', '支持我们'],
      ['About', '关于'],
      ['Blog', '博客'],
      ['Discord Bot', 'Discord 机器人'],
      ['FAQ & help', '常见问题与帮助'],
      ['Donate & contribute', '捐赠与贡献'],
      ['Browser extension', '浏览器扩展'],
      ['Socials', '社交'],
      ['Steam group', 'Steam 群组'],
      ['Steam Group', 'Steam 群组'],
      ['Steam curator', 'Steam 鉴赏家'],
      ['Your Profile', '你的资料'],
      ['Your Games', '你的游戏'],
      ['Your Wishlist', '你的愿望单'],
      ['Your Watchlist', '你的关注列表'],
      ['Sign out', '退出登录'],
      ['Fair use disclaimer · Privacy · Cookies', '合理使用声明 · 隐私 · Cookie'],
      ['Steam and the Steam logo are trademarks of Valve Corporation.', 'Steam 及 Steam 徽标为 Valve Corporation 的商标。'],
      ['All other trademarks are property of their respective owners.', '其他所有商标归各自所有者所有。'],
      ['All times on the site are UTC.', '本站所有时间均为 UTC。'],
      ['Database of everything on Steam.', '涵盖 Steam 上一切内容的数据库。'],
      ['← Prev', '← 上一页'],
      ['Next →', '下一页 →']
    ],

    '首页板块与榜单': [
      ['Discovery', '发现'],
      ['Sales & Deals', '特卖与优惠'],
      ['Upcoming releases', '即将发售'],
      ['Release calendar', '发售日历'],
      ['Free promotions', '免费促销'],
      ['Price changes', '价格变动'],
      ['When is next sale?', '下次特卖是什么时候？'],
      ['Tools', '工具'],
      ['Instant search', '即时搜索'],
      ['Steam Status', 'Steam 状态'],
      ['Steam Web API', 'Steam Web API'],
      ['Game tags', '游戏标签'],
      ['Badges leaderboard', '徽章排行榜'],
      ['Engines & technologies', '引擎与技术'],
      ['Game releases by year', '按年份查看发售'],
      ['Change history', '变更历史'],
      ['Rankings', '排行榜'],
      ['Top rated games', '好评榜'],
      ['Global top sellers', '全球畅销榜'],
      ['Weekly top sellers', '周畅销榜'],
      ['Most followed games', '最多人关注'],
      ['Most wishlisted games', '最多人许愿'],
      ['Wishlist activity', '愿望单动态'],
      ['Daily active users', '每日活跃用户'],
      ['Most Played Games', '最多人在玩'],
      ['Players Now', '当前玩家数'],
      ['24h Peak', '24 小时峰值'],
      ['Steam Sale Events', 'Steam 特卖活动'],
      ['Browse and filter current deals…', '浏览并筛选当前优惠…'],
      ['View all sale events…', '查看全部特卖活动…'],
      ['Steam News Pop-ups', 'Steam 新闻弹窗'],
      ['View all popups…', '查看全部弹窗…'],
      ['Recent app events', '最近应用变更'],
      ['Recent package events', '最近包变更'],
      ['View more app history entries…', '查看更多应用历史…'],
      ['View more package history entries…', '查看更多包历史…'],
      ['Swipe right on a game to view details.', '向右滑动游戏查看详情。'],
      ['Trending Games', '趋势游戏'],
      ['Popular Releases', '热门新发售'],
      ['Hot Releases', '热门发售'],
      ['Browse all deals', '浏览全部优惠'],
      ['Getting Started with Steam Hardware', 'Steam 硬件入门'],
      ['Frequently asked questions', '常见问题']
    ],

    /* Tools 组：此前只补了首页板块，Tools 下这几项漏了 */
    '工具与数据库': [
      ['Patch notes', '补丁说明'],
      ['Tags', '标签'],
      ['Database', '数据库'],
      ['Developers', '开发商'],
      ['Publishers', '发行商'],
      ['Game tags', '游戏标签'],
      ['Engines & technologies', '引擎与技术'],
      ['Change history', '变更历史']
    ],

    /* 含品牌名的整句：品牌名保留原文，句子其余部分正常翻译。
       需要 protectMode 为 soft 才会生效。 */
    '含 SteamDB 的整句': [
      ['SteamDB is not affiliated with Valve or Steam.', 'SteamDB 与 Valve 或 Steam 没有隶属关系。'],
      ['SteamDB is a free, independent database covering the entire Steam catalog.', 'SteamDB 是一个免费、独立的数据库，涵盖 Steam 全部目录。'],
      ['Trending on SteamDB', 'SteamDB 热门趋势'],
      ['SteamDB in numbers', 'SteamDB 数据一览']
    ],

    '搜索与无障碍标签': [
      ['Toggle menu', '切换菜单'],
      ['Perform search', '执行搜索'],
      ['Open search', '打开搜索'],
      ['User menu', '用户菜单'],
      ['Previous events', '上一组活动'],
      ['Next events', '下一组活动'],
      ['Filter events', '筛选活动'],
      ['Previous messages', '上一条消息'],
      ['Next messages', '下一条消息'],
      ['View event on Steam', '在 Steam 上查看活动'],
      ['New concurrent players max peak today', '今日新增同时在线人数峰值'],
      ['Search powered by Algolia', '搜索由 Algolia 提供'],
      ['M toggle this menu / focus search', 'M 切换菜单 / 聚焦搜索'],
      ['Use slash key ( / ) to focus search from anywhere', '按斜杠键（/）可在任意位置聚焦搜索'],
      ['Use arrow keys ( ↑ and ↓ ) to navigate suggestions, then Enter to go', '用方向键（↑ 和 ↓）浏览建议，回车前往'],
      ['Use escape ( Esc ) to close search', '按 Esc 关闭搜索'],
      ['Enter an appid to be redirected to the app page', '输入 appid 可跳转到应用页面'],
      ['Enter Submit to view all results.', '按回车查看全部结果。'],
      ['Ctrl+Enter View and filter in instant search.', 'Ctrl+Enter 在即时搜索中查看并筛选。'],
      /* <kbd> 标签会把提示拆成若干段，逐段也要能命中 */
      ['toggle this menu', '切换菜单'],
      ['focus search', '聚焦搜索']
    ],

    /* /charts/ 在线人数页 */
    'Charts 页': [
      ['Concurrent Steam Users', 'Steam 同时在线用户'],
      ['Most played games', '游玩人数最多的游戏'],
      ['Rank', '排名'],
      ['Current', '当前'],
      ['All-Time Peak', '历史峰值'],
      ['High-resolution Steam charts with concurrent player counts for all Steam games, including historic data.', '高精度 Steam 在线人数图表，覆盖全部 Steam 游戏，含历史数据。'],
      ['We update data and charts for the current top thousand games every 5 minutes, and the rest every 10 minutes.', '当前排名前一千的游戏每 5 分钟更新一次数据与图表，其余每 10 分钟更新。'],
      ['Table is only showing games with 1K current players, or 10K peak.', '表格仅显示当前在线 1K 以上或峰值 10K 以上的游戏。'],
      ['Sign in to view full table, or search for a game in the navbar.', '登录后查看完整表格，或在顶部导航栏搜索游戏。'],
      ['High-resolution Steam charts', '高精度 Steam 图表']
    ],

    '通用界面（待验证）': [
      ['Apps', '应用'],
      ['App Info', '应用信息'],
      ['Packages', '包'],
      ['Bundles', '捆绑包'],
      ['Free Packages', '免费内容'],
      ['Top Rated', '好评榜'],
      ['Most Played', '最热玩'],
      ['Most Wished', '最想玩'],
      ['Upcoming', '即将推出'],
      ['News', '新闻'],
      ['Depots', '文件'],
      ['Configuration', '配置'],
      ['Cloud saves', '云存档'],
      ['History', '历史'],
      ['Rating', '好评率'],
      ['Price', '价格'],
      ['Current Price', '当前价格'],
      ['Lowest Recorded Price', '史低价格'],
      ['Highest Price', '最高价格'],
      ['Discount', '折扣'],
      ['Currency', '货币'],
      ['Converted', '换算后'],
      ['Release Date', '发售日期'],
      ['Developer', '开发商'],
      ['Publisher', '发行商'],
      ['Followers', '关注数'],
      ['Follow', '关注'],
      ['Unfollow', '取消关注'],
      ['Wishlist', '愿望单'],
      ['Type', '类型'],
      ['Category', '分类'],
      ['Genres', '类型'],
      ['Features', '特性'],
      ['Languages', '语言'],
      ['Platforms', '平台'],
      ['Windows', 'Windows'],
      ['macOS', 'macOS'],
      ['Linux', 'Linux'],
      ['Next', '下一页'],
      ['Previous', '上一页'],
      ['Showing', '显示'],
      ['No results', '无结果'],
      ['Loading', '加载中'],
      ['Show more', '显示更多'],
      ['Sign in', '登录'],
      ['Log in', '登录'],
      ['Log out', '退出登录'],
      ['Settings', '设置'],
      ['Home', '首页'],
      ['Statistics', '统计'],
      ['Trending', '趋势'],
      ['Peak', '峰值'],
      ['Players', '玩家数'],
      ['Concurrent players', '同时在线人数'],
      ['All-time', '历史'],
      ['Yesterday', '昨天'],
      ['Last 7 days', '近 7 天'],
      ['Last 30 days', '近 30 天']
    ],

    /* 译文存疑：残留英文标点等未精修痕迹，多半落在官方「未批准」的
       那部分里。若你在 Crowdin 上确认了正确译法，欢迎回来修正。 */
    '存疑待复核': [
      ['Hidden achievement:', '隐藏成就：']
    ],

    '不翻译（白名单）': [
      ['SteamDB', null],
      ['Steam', null],
      ['Valve', null],
      ['PCGamingWiki', null],
      ['Steam Hunters', null],
      ['GitHub', null],
      ['CS2', null],
      ['CS:GO', null],
      ['DLC', null],
      ['F2P', null],
      ['N/A', null]
    ]
  },

  /* 短语级替换：只在 UI 元素内生效 */
  phrases: [
    ['toggle this menu', '切换菜单'],
    ['focus search', '聚焦搜索'],
    ['Sort by', '排序方式'],
    ['Show more', '显示更多'],
    ['Read more', '阅读更多'],
    ['Last updated', '最后更新'],
    ['Release date', '发售日期'],
    ['Lowest recorded price', '史低价格'],
    ['Current price', '当前价格'],
    ['All-time peak', '历史峰值'],
    ['Players online', '在线玩家'],
    ['Sign in to', '登录后']
  ],

  /* 正则规则：处理带数字 / 单位的文案 */
  rules: [
    { re: /^just now$/i, rep: '刚刚' },
    {
      re: /\b(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/i,
      rep: (_m, n, unit) => n + ' ' + UNIT_MAP[unit.toLowerCase().replace(/s$/, '')] + '前'
    },
    { re: /^([\d,]+)\s+players?$/i, rep: '$1 名玩家' },
    { re: /^([\d,]+)\s+followers?$/i, rep: '$1 人关注' },
    { re: /^(\d+)\s+results?$/i, rep: '$1 个结果' },
    { re: /^(\d+)\s+of\s+(\d+)$/, rep: '$1 / $2' },
    /* Ends 19th October -> 10月19日结束 */
    {
      re: /^Ends\s+(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)$/i,
      rep: (_m, d, mon) => (SDB_MONTH[mon.toLowerCase()] || mon) + '月' + d + '日结束'
    },
    /* 数量常与单位拆在不同元素里（<span>564k</span> apps in database），
       数字部分设为可选，缺失时译文接在前一个数字后面读也通顺。 */
    {
      re: /^([\d.,]+\s*[kM]?\s+)?(\w+)\s+in\s+database$/i,
      rep: (_m, n, w) => (n ? '数据库中有 ' + n.trim() + ' 个' : '个') +
        (SDB_WORD[w.toLowerCase()] || w) + (n ? '' : '在数据库中')
    },
    {
      re: /^([\d.,]+\s*[kM]?\s+)?(\w+)\s+this\s+year$/i,
      rep: (_m, n, w) => (n ? '今年新增 ' + n.trim() + ' 个' : '个') +
        (SDB_WORD[w.toLowerCase()] || w) + (n ? '' : '今年新增')
    },
    {
      re: /^([\d,]+\s+)?(second|minute|hour|day|week|month|year)s?\s+ago$/i,
      rep: (_m, n, unit) => (n ? n.trim() + ' ' : '') +
        UNIT_MAP[unit.toLowerCase()] + '前'
    }
  ]
});


  const site = pickSite();
  if (!site) {
    console.log('[Web 中文化补充] v2.4.0 当前站点未适配：' + location.hostname);
    return;
  }
  console.log('%c[Web 中文化补充] v2.4.0 · ' + site.name, 'font-weight:bold');
  boot(site);

})();

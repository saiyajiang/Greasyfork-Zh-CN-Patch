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

    /* 整段匹配不中时，按句再试一次。
       导出环节本来就会按句拆分，替换却只看整段——于是出现「导出认为
       已覆盖、页面上却原样不动」。只做精确匹配，不启用短语替换，
       避免对长文本过度改动。 */
    if (/[.!?]\s/.test(t) && t.length > 20) {
      const parts = splitSentences(t);
      if (parts.length > 1) {
        let out = t;
        let changed = false;
        for (let i = 0; i < parts.length; i++) {
          const one = lookupExact(parts[i]);
          if (one !== null) {
            out = out.replace(parts[i], one);
            changed = true;
          }
        }
        if (changed) return normalize(out);
      }
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

  /* SteamDB 等站点用 <br> 折行，把 'Most Played<br>Games' 拆成两个
     文本节点，逐节点匹配只译出前半截，留下 '最热玩 Games' 这种半吊子。
     这里先把 <br> 当作空格拼回整句再查词典，命中则整体替换。 */
  /* 只有这类元素才做折行合并。表头、标签、按钮的折行纯粹是为了排版，
     拼回去不影响语义；而侧边导航那种容器里塞着十几个 <a>，一旦命中
     词典就会把整列塌成一行，直接错位。 */
  const BR_JOIN_TAGS = new Set([
    'TH', 'TD', 'LABEL', 'BUTTON', 'SUMMARY', 'CAPTION', 'FIGCAPTION',
    'DT', 'DD', 'OPTION', 'LEGEND', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
  ]);

  function tryBrJoined(node, parent) {
    if (!parent.querySelector || !parent.querySelector('br')) return false;
    if (!BR_JOIN_TAGS.has(parent.tagName)) return false;
    if (parent.children.length > 1) return false;   // 除 <br> 外不许有其他子元素

    let first = null;
    let joined = '';
    let textCount = 0;
    for (let c = parent.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) {
        if (c.nodeValue.trim()) textCount++;
        joined += c.nodeValue;
        if (!first && c.nodeValue.trim()) first = c;
      } else if (c.nodeType === 1) {
        joined += (c.tagName === 'BR' ? ' ' : (c.textContent || ''));
      }
    }
    if (first !== node) return false;           // 只由首节点触发，避免重复
    if (textCount > 3) return false;
    const t = normalize(joined);
    if (!t || t.length > 60) return false;      // 短标签才合并，长段落不碰

    const next = translate(t, isUIElement(parent));
    if (next === null || next === t) return false;

    setText(node, wrapPreserve(node.nodeValue, next));
    for (let c = parent.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 && c !== node && c.nodeValue && c.nodeValue.trim()) {
        records.push({ node: c, before: c.nodeValue });
        seen.add(c);
        c.nodeValue = '';
      }
    }
    return true;
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

    if (tryBrJoined(node, parent)) return;

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
  /* 被标签切断的残片：括号不配对才算。'macOS (Apple Silicon)' 这种
     自带配对括号的是完整 UI 标签，不能当残片丢掉。 */
  function isFragment(t) {
    const opens = (t.match(/[\(\[]/g) || []).length;
    const closes = (t.match(/[\)\]]/g) || []).length;
    if (opens !== closes) return true;
    return /^[\)\]】]/.test(t.trim());
  }
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
  /* 署名形如 'By Bethesda'、'By Plug In Digital,Dear Villagers'。
     排除 'By default ...'、'By the ...' 这类普通句首。 */
  const BYLINE_RE = /^By\s+(?!default\b|the\b|this\b|these\b|using\b|selecting\b|clicking\b|opening\b|adding\b|removing\b|comparing\b|only\b|not\b|now\b)\S/i;
  const ORDINAL_DATE_RE = /^(?:Ends|Starts|Until)\s+\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+/;

  function classify(t) {
    if (CJK_RE.test(t)) return '已含中文（多半已翻译）';
    // 软保护下含品牌名的句子照常列入建议，译文里保留品牌名即可
    if (PROTECT_HARD && PROTECT_RE.test(t)) {
      return '受保护专名（' + (SITE.protectLabel || SITE.name) + '）';
    }
    if (SKIP_WORDS.has(t.toLowerCase())) return '专名/占位符（白名单）';
    if (PLACEHOLDER_RE.test(t)) return '占位符';
    if (isFragment(t)) return '句子残片（被标签切断）';
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


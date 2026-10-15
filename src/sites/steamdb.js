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

  /* 品牌名与第三方站名不翻译 */
  protectRe: 'steamdb',
  protectLabel: 'SteamDB',

  /* 游戏名、开发商、发行商、包名等数据内容不翻译 */
  skipClassRe: 'app-name|game-name|app-title|package-name|developer|publisher|table-hover|chart|graph|highcharts|code',

  /* 数据区：内部文本视为数据，不翻译也不建议翻译 */
  dataSelectors: '.app-name, .game-name, .app-title, .home-game, .chart, .highcharts-container, [class*="leaderboard"]',

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
      ['Getting Started with Steam Hardware', 'Steam 硬件入门'],
      ['Frequently asked questions', '常见问题']
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
      ['Ctrl+Enter View and filter in instant search.', 'Ctrl+Enter 在即时搜索中查看并筛选。']
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
    {
      re: /^([\d.,]+)\s*([kM]?)\s+(\w+)\s+in\s+database$/i,
      rep: (_m, n, u, w) => '数据库中有 ' + n + u + ' 个' + (SDB_WORD[w.toLowerCase()] || w)
    },
    {
      re: /^([\d.,]+)\s*([kM]?)\s+(\w+)\s+this\s+year$/i,
      rep: (_m, n, u, w) => '今年新增 ' + n + u + ' 个' + (SDB_WORD[w.toLowerCase()] || w)
    }
  ]
});

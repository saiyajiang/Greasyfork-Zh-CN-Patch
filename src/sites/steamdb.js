/* ==================================================================
 * SteamDB 词典
 * ------------------------------------------------------------------
 * 词条来源：
 *   1. 官方 Crowdin 项目（SteamDatabase/BrowserExtension）已 100% 完成的
 *      简体中文翻译，取自 _locales/zh_CN/messages.json —— 译法经过官方
 *      审核，术语一致性有保障，优先采用。
 *   2. 少量高置信度通用界面词，标记为「待验证」，遇到不通顺的请反馈。
 *
 * 补充新词：菜单「导出本页未翻译的英文文案」，把输出粘到对应分组即可。
 * ================================================================== */

registerSite({
  id: 'steamdb',
  name: 'SteamDB',
  hosts: ['steamdb.info'],

  /* SteamDB 无官方中文界面，进站即翻译 */
  defaultEnabled: true,

  /* 品牌名与第三方站名不翻译 */
  protectRe: 'steamdb',

  /* 游戏名、开发商、发行商、包名等数据内容不翻译 */
  skipClassRe: 'app-name|game-name|app-title|package-name|developer|publisher|table-hover|chart|graph|highcharts|code',

  /* 站内特有的 UI 容器选择器 */
  uiSelectors: '.header-menu, .footer, .tabnav, .page-header, .sidebar, .pagination, .btn-group, .btn',

  dictGroups: {
    '官方术语（Crowdin 已确认）': [
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
      ['Hidden achievement:', '隐藏成就：'],
      ['Sort by time', '按解锁时间顺序'],
      ['No badge crafted', '徽章未合成'],
      ['Reveal spoilers', '显示隐藏文本'],
      ['Open in Desktop App', '在桌面应用中打开'],
      ['View on SteamDB', '在 SteamDB 上查看'],
      ['View on Steam Hunters', '在 Steam Hunters 上查看'],
      ['View on PCGamingWiki', '在 PCGamingWiki 上查看'],
      ['Steam appears to be experiencing some downtime.', 'Steam 似乎出现了一些故障。']
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
    { re: /^(\d+)\s+of\s+(\d+)$/, rep: '$1 / $2' }
  ]
});

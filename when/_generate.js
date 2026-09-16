/* 生成器：中/英/日 × 6 时区 = 18 个时间类内页
 * 运行：node when/_generate.js
 */
const fs = require("fs");
const path = require("path");

const WHEN_DIR = __dirname;

const CITIES = [
  { slug: "beijing", tz: "Asia/Shanghai",      zh: "北京",   en: "Beijing",   ja: "北京",     offset: "UTC+8" },
  { slug: "tokyo",   tz: "Asia/Tokyo",         zh: "东京",   en: "Tokyo",     ja: "東京",     offset: "UTC+9" },
  { slug: "pst",     tz: "America/Los_Angeles",zh: "太平洋", en: "Pacific",   ja: "太平洋",   offset: "PT" },
  { slug: "newyork", tz: "America/New_York",   zh: "纽约",   en: "New York",  ja: "ニューヨーク", offset: "ET" },
  { slug: "london",  tz: "Europe/London",      zh: "伦敦",   en: "London",    ja: "ロンドン", offset: "GMT" },
  { slug: "utc",     tz: "UTC",                zh: "UTC",    en: "UTC",       ja: "UTC",      offset: "UTC+0" },
];

// 各时区链接显示文本（按语言）
const TZ_LABELS = {
  zh: { beijing: "北京时间 UTC+8", tokyo: "东京时间 UTC+9", pst: "太平洋时间 PT", newyork: "纽约时间 ET", london: "伦敦时间 GMT", utc: "UTC 时间" },
  en: { beijing: "Beijing UTC+8", tokyo: "Tokyo UTC+9", pst: "Pacific PT", newyork: "New York ET", london: "London GMT", utc: "UTC" },
  ja: { beijing: "北京 UTC+8", tokyo: "東京 UTC+9", pst: "太平洋 PT", newyork: "ニューヨーク ET", london: "ロンドン GMT", utc: "UTC" },
};

// 各语言界面文本
const I18N = {
  zh: {
    htmlLang: "zh-CN",
    brandSub: "额度重置动态监测",
    themeLabel: "切换深色模式",
    home: "首页",
    crumbMid: "重置时间",
    tzSwitch: "切换时区：",
    langSwitch: "语言：",
    eyebrow: "next estimated reset",
    countdownTitle: "距离预测重置窗口结束",
    d: "天", h: "时", m: "分", s: "秒",
    predLabel: "预测窗口：",
    loading: "正在加载…",
    icsBtn: "订阅 ICS 日历",
    card1: "最近一次全员重置",
    card2: "距今天数",
    card3: "历史记录",
    historyTitleSuffix: "重置历史记录",
    thTime: "时间", thType: "类型", thContent: "内容", thSource: "原文",
    footerNote: (city, offset) => `所有时间均已转换为${city}时间（${offset}）· 预测仅供参考`,
    footerLink: "查看最近重置原文 ↗",
    title: (city, offset) => `Codex 重置时间（${city}时间 ${offset}）— 下次重置倒计时与历史记录`,
    desc: (city, offset) => `查询 Codex / Astra 额度重置时间，自动转换为${city}时间（${offset}）。含下次重置预测窗口、历史重置记录和 ICS 日历订阅。`,
    h1: (city, offset) => `Codex 重置时间 · ${city}时间（${offset}）`,
    sub: (city, tz) => `所有 Codex / Astra 额度重置时间已自动转换为${city}时间（${tz}）。下方倒计时显示距离下次预测重置窗口结束还剩多久，可一键订阅到日历。`,
    utcH1: () => `Codex 重置时间 · UTC 协调世界时`,
    utcSub: () => `所有 Codex / Astra 额度重置时间以 UTC 协调世界时（UTC+0）显示，方便跨时区核对。下方倒计时显示距离下次预测重置窗口结束还剩多久，可一键订阅到日历。`,
    utcFooter: () => `所有时间均以 UTC 协调世界时显示 · 预测仅供参考`,
  },
  en: {
    htmlLang: "en",
    brandSub: "Quota Reset Monitoring",
    themeLabel: "Toggle dark mode",
    home: "Home",
    crumbMid: "Reset Time",
    tzSwitch: "Switch timezone:",
    langSwitch: "Language:",
    eyebrow: "next estimated reset",
    countdownTitle: "Time until predicted reset window ends",
    d: "days", h: "hrs", m: "min", s: "sec",
    predLabel: "Predicted window:",
    loading: "Loading…",
    icsBtn: "Subscribe to ICS calendar",
    card1: "Last global reset",
    card2: "Days since",
    card3: "History records",
    historyTitleSuffix: "Reset History",
    thTime: "Time", thType: "Type", thContent: "Content", thSource: "Source",
    footerNote: (city, offset) => `All times converted to ${city} (${offset}) · predictions are estimates`,
    footerLink: "View latest reset source ↗",
    title: (city, offset) => `Codex Reset Time (${city} ${offset}) — Next Reset Countdown & History`,
    desc: (city, offset) => `Check Codex / Astra quota reset times, automatically converted to ${city} time (${offset}). Includes next reset prediction window, historical reset records, and ICS calendar subscription.`,
    h1: (city, offset) => `Codex Reset Time · ${city} (${offset})`,
    sub: (city, tz) => `All Codex / Astra quota reset times are automatically converted to ${city} time (${tz}). The countdown below shows how long until the next predicted reset window ends. Subscribe to your calendar with one click.`,
    utcH1: () => `Codex Reset Time · UTC`,
    utcSub: () => `All Codex / Astra quota reset times are shown in UTC (Coordinated Universal Time) for easy cross-timezone reference. The countdown below shows how long until the next predicted reset window ends. Subscribe to your calendar with one click.`,
    utcFooter: () => `All times shown in UTC · predictions are estimates`,
  },
  ja: {
    htmlLang: "ja",
    brandSub: "クォータリセット監視",
    themeLabel: "ダークモード切替",
    home: "ホーム",
    crumbMid: "リセット時間",
    tzSwitch: "タイムゾーン切替：",
    langSwitch: "言語：",
    eyebrow: "next estimated reset",
    countdownTitle: "予測リセットウィンドウ終了まで",
    d: "日", h: "時", m: "分", s: "秒",
    predLabel: "予測ウィンドウ：",
    loading: "読み込み中…",
    icsBtn: "ICS カレンダーを購読",
    card1: "直近の全体リセット",
    card2: "経過日数",
    card3: "履歴レコード",
    historyTitleSuffix: "リセット履歴",
    thTime: "時間", thType: "種別", thContent: "内容", thSource: "原文",
    footerNote: (city, offset) => `すべての時刻は ${city}（${offset}）に変換済み · 予測は目安です`,
    footerLink: "直近リセットの原文を見る ↗",
    title: (city, offset) => `Codex リセット時間（${city} ${offset}）— 次回リセットカウントダウンと履歴`,
    desc: (city, offset) => `Codex / Astra のクォータリセット時間を${city}時間（${offset}）に自動変換して表示。次回リセット予測ウィンドウ、過去のリセット履歴、ICS カレンダー購読に対応。`,
    h1: (city, offset) => `Codex リセット時間 · ${city}（${offset}）`,
    sub: (city, tz) => `Codex / Astra のすべてのクォータリセット時間を${city}時間（${tz}）に自動変換しています。下のカウントダウンは次回予測リセットウィンドウ終了までの残り時間です。ワンクリックでカレンダーに購読できます。`,
    utcH1: () => `Codex リセット時間 · UTC 協定世界時`,
    utcSub: () => `Codex / Astra のすべてのクォータリセット時間を UTC 協定世界時（UTC+0）で表示し、タイムゾーンをまたいだ確認に便利です。下のカウントダウンは次回予測リセットウィンドウ終了までの残り時間です。ワンクリックでカレンダーに購読できます。`,
    utcFooter: () => `すべての時刻は UTC 協定世界時で表示 · 予測は目安です`,
  },
};

const LANGS = ["zh", "en", "ja"];
const LANG_LABELS = { zh: "中文", en: "English", ja: "日本語" };

// 图标内联 SVG
const ICON = {
  mark: `<svg viewBox="0 0 32 32"><path d="M7 9h18v5H7zm0 10h18v5H7z" fill="#6fe89d"/><circle cx="22" cy="11.5" r="4.5" fill="#f5d76e"/></svg>`,
  theme: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.5 15.3A9 9 0 1 1 8.7 3.5a7 7 0 0 0 11.8 11.8Z"/></svg>`,
  ics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4m-2-2h4"/></svg>`,
};

function buildPage(city, lang) {
  const T = I18N[lang];
  const isUtc = city.slug === "utc";
  const cityName = city[lang];
  const offset = city.offset;

  // 相对路径：zh 在 when/，en/ja 在 when/{lang}/
  const depth = lang === "zh" ? 1 : 2;
  const cssJsPath = "../".repeat(depth - 1);           // zh:""  en/ja:"../"
  const indexPath = "../".repeat(depth);               // zh:"../"  en/ja:"../../"
  const langDir = lang === "zh" ? "" : lang + "/";

  // 语言切换链接（hreflang + lang-nav 共用）
  const hrefs = {
    zh: lang === "zh" ? `codex-reset-${city.slug}.html` : `../codex-reset-${city.slug}.html`,
    en: lang === "en" ? `codex-reset-${city.slug}.html` : (lang === "zh" ? `en/codex-reset-${city.slug}.html` : `../en/codex-reset-${city.slug}.html`),
    ja: lang === "ja" ? `codex-reset-${city.slug}.html` : (lang === "zh" ? `ja/codex-reset-${city.slug}.html` : `../ja/codex-reset-${city.slug}.html`),
  };
  const xDefault = hrefs.zh;

  const hreflangTags = LANGS.map((l) =>
    `  <link rel="alternate" hreflang="${l === "zh" ? "zh-CN" : l}" href="${hrefs[l]}">`
  ).concat(`  <link rel="alternate" hreflang="x-default" href="${xDefault}">`).join("\n");

  // 时区导航（同语言内切换，当前页 active）
  const tzNav = CITIES.map((c) => {
    const active = c.slug === city.slug ? ' class="active"' : "";
    return `      <a href="codex-reset-${c.slug}.html"${active}>${TZ_LABELS[lang][c.slug]}</a>`;
  }).join("\n");

  // 语言导航
  const langNav = LANGS.map((l) => {
    const active = l === lang ? ' class="active"' : "";
    return `      <a href="${hrefs[l]}"${active}>${LANG_LABELS[l]}</a>`;
  }).join("\n");

  const eyebrowCity = isUtc ? "UTC" : cityName;
  const historyTitle = isUtc
    ? `${T.historyTitleSuffix}（UTC）`
    : `${T.historyTitleSuffix}（${cityName}）`;

  const h1 = isUtc ? T.utcH1() : T.h1(cityName, offset);
  const sub = isUtc ? T.utcSub() : T.sub(cityName, city.tz);
  const footerNote = isUtc ? T.utcFooter() : T.footerNote(cityName, offset);
  const title = isUtc
    ? (lang === "zh" ? "Codex 重置时间（UTC 时间）— 下次重置倒计时与历史记录"
       : lang === "en" ? "Codex Reset Time (UTC) — Next Reset Countdown & History"
       : "Codex リセット時間（UTC）— 次回リセットカウントダウンと履歴")
    : T.title(cityName, offset);
  const desc = isUtc
    ? (lang === "zh" ? "查询 Codex / Astra 额度重置时间，以 UTC 协调世界时显示。含下次重置预测窗口、历史重置记录和 ICS 日历订阅。"
       : lang === "en" ? "Check Codex / Astra quota reset times in UTC. Includes next reset prediction window, historical reset records, and ICS calendar subscription."
       : "Codex / Astra のクォータリセット時間を UTC 協定世界時で表示。次回リセット予測ウィンドウ、過去のリセット履歴、ICS カレンダー購読に対応。")
    : T.desc(cityName, offset);

  // UTC 面包屑特殊处理
  const crumbLast = isUtc ? (lang === "zh" ? "UTC 时间" : lang === "en" ? "UTC" : "UTC") : cityName;

  return `<!doctype html>
<html lang="${T.htmlLang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="theme-color" content="#0b1220">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%230b1220'/%3E%3Cpath d='M18 20h28v7H18zm0 17h28v7H18z' fill='%237cfe8e'/%3E%3Ccircle cx='42' cy='23.5' r='7' fill='%23f8d96b'/%3E%3C/svg%3E">
${hreflangTags}
  <link rel="stylesheet" href="${cssJsPath}when.css">
  <script>
    window.PAGE_CONFIG = {
      lang: "${lang}",
      timezone: "${city.tz}",
      city: "${cityName}",
      cityEn: "${city.en}",
      offset: "${offset}"
    };
  </script>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="${indexPath}index.html">
        <div class="mark" aria-hidden="true">${ICON.mark}</div>
        <div class="brand-copy"><strong>Codex Reset Watch</strong><span>${T.brandSub}</span></div>
      </a>
      <button class="icon-btn" id="themeBtn" type="button" aria-label="${T.themeLabel}" title="${T.themeLabel}">${ICON.theme}</button>
    </header>

    <nav class="breadcrumb"><a href="${indexPath}index.html">${T.home}</a> / ${T.crumbMid} / ${crumbLast}</nav>

    <h1 class="page-title">${h1}</h1>
    <p class="page-sub">${sub}</p>

    <nav class="tz-nav" aria-label="${T.tzSwitch}">
      <span class="tz-label">${T.tzSwitch}</span>
${tzNav}
    </nav>

    <nav class="lang-nav" aria-label="${T.langSwitch}">
      <span class="lang-label">${T.langSwitch}</span>
${langNav}
    </nav>

    <section class="panel countdown">
      <div class="eyebrow"><span class="spark">✦</span> ${T.eyebrow} · ${eyebrowCity}</div>
      <h2>${T.countdownTitle}</h2>
      <div class="clock" aria-label="${T.countdownTitle}">
        <div class="clock-unit"><strong id="d">--</strong><span>${T.d}</span></div>
        <div class="clock-unit"><strong id="h">--</strong><span>${T.h}</span></div>
        <div class="clock-unit"><strong id="m">--</strong><span>${T.m}</span></div>
        <div class="clock-unit"><strong id="s">--</strong><span>${T.s}</span></div>
      </div>
      <div class="pred-row">
        <p>${T.predLabel}<span class="range" id="predRange">${T.loading}</span></p>
        <button class="ics-btn" id="icsBtn" type="button">
          ${ICON.ics}
          ${T.icsBtn}
        </button>
      </div>
    </section>

    <section class="info-grid">
      <article class="panel info-card"><span>${T.card1}</span><strong class="small" id="lastReset">—</strong></article>
      <article class="panel info-card"><span>${T.card2}</span><strong id="daysAgo">—</strong></article>
      <article class="panel info-card"><span>${T.card3}</span><strong id="eventCount">—</strong></article>
    </section>

    <section class="panel history">
      <h2>${historyTitle}</h2>
      <table>
        <thead>
          <tr><th>${T.thTime}</th><th>${T.thType}</th><th>${T.thContent}</th><th>${T.thSource}</th></tr>
        </thead>
        <tbody id="historyBody">
          <tr><td colspan="4">${T.loading}</td></tr>
        </tbody>
      </table>
    </section>

    <footer class="footer">
      <span>${footerNote}</span>
      <span><a id="lastResetLink" href="#" target="_blank" rel="noreferrer">${T.footerLink}</a></span>
    </footer>
  </main>

  <script src="${cssJsPath}when.js"></script>
  <script>
    const savedTheme = localStorage.getItem("reset-theme");
    if (savedTheme) document.documentElement.dataset.theme = savedTheme;
    document.getElementById("themeBtn").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("reset-theme", next);
    });
  </script>
</body>
</html>
`;
}

let written = 0;
for (const lang of LANGS) {
  const dir = lang === "zh" ? WHEN_DIR : path.join(WHEN_DIR, lang);
  if (lang !== "zh") fs.mkdirSync(dir, { recursive: true });
  for (const city of CITIES) {
    const out = path.join(dir, `codex-reset-${city.slug}.html`);
    fs.writeFileSync(out, buildPage(city, lang), "utf8");
    written++;
    console.log(`✓ ${path.relative(WHEN_DIR, out)}`);
  }
}
console.log(`\nDone. Generated ${written} pages.`);

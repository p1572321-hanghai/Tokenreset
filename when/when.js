/* Codex Reset Watch — 时间类内页共享逻辑
 * 每个页面通过 window.PAGE_CONFIG 注入时区和语言配置。
 */
(function () {
  const CFG = window.PAGE_CONFIG || {};
  const TZ = CFG.timezone || "Asia/Shanghai";
  const LANG = CFG.lang || "zh";

  // 根据页面深度计算 events.json 的相对路径
  // when/xxx.html → ../events.json ; when/en/xxx.html → ../../events.json
  const segments = location.pathname.split("/").filter(Boolean);
  const DATA_URL = "../".repeat(Math.max(0, segments.length - 1)) + "events.json";

  // 各语言对应的日期 locale
  const LOCALE = { zh: "zh-CN", en: "en-US", ja: "ja-JP" }[LANG] || "zh-CN";

  // 界面文本翻译表
  const I18N = {
    zh: {
      global: "全员重置",
      banked: "重置卡",
      view: "查看 ↗",
      daysAgo: "天前",
      icsSummary: "Codex/Astra 重置预测窗口",
      icsDesc: "基于历史重置记录推算的预测窗口。来源：Codex Reset Watch",
    },
    en: {
      global: "Global Reset",
      banked: "Banked Reset",
      view: "View ↗",
      daysAgo: "days ago",
      icsSummary: "Codex/Astra Reset Prediction Window",
      icsDesc: "Predicted window based on historical reset records. Source: Codex Reset Watch",
    },
    ja: {
      global: "全体リセット",
      banked: "バンクリセット",
      view: "表示 ↗",
      daysAgo: "日前",
      icsSummary: "Codex/Astra リセット予測ウィンドウ",
      icsDesc: "過去のリセット履歴に基づく予測ウィンドウ。出典：Codex Reset Watch",
    },
  };
  const T = I18N[LANG] || I18N.zh;

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 把 ISO 时间格式化为目标时区的完整日期时间
  const fmtFull = (iso) =>
    new Date(iso).toLocaleString(LOCALE, { timeZone: TZ, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  // 仅日期（用于预测区间）
  const fmtDate = (d) =>
    d.toLocaleDateString(LOCALE, { timeZone: TZ, year: "numeric", month: "long", day: "numeric" });

  // 周几
  const fmtWeekday = (d) =>
    d.toLocaleDateString(LOCALE, { timeZone: TZ, weekday: "long" });

  const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

  let events = [];
  let predStart = null;
  let predEnd = null;
  let target = null;

  // ---- ICS 生成 ----
  function icsDate(d) {
    // ICS 要求 UTC 时间，格式 YYYYMMDDTHHMMSSZ
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  }

  function downloadICS() {
    if (!predStart || !predEnd) return;
    const uid = `codex-reset-${icsDate(predStart)}@codexreset.watch`;
    const summary = `${T.icsSummary}（${CFG.cityEn || CFG.city || TZ}）`;
    const desc = T.icsDesc;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Codex Reset Watch//Reset Prediction//" + LANG.toUpperCase(),
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(predStart)}`,
      `DTEND:${icsDate(predEnd)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codex-reset-${(CFG.cityEn || "calendar").toLowerCase().replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---- 倒计时 ----
  function tick() {
    const diff = target ? Math.max(0, target - Date.now()) : 0;
    const vals = target
      ? [Math.floor(diff / 864e5), Math.floor((diff % 864e5) / 36e5), Math.floor((diff % 36e5) / 6e4), Math.floor((diff % 6e4) / 1000)]
      : ["--", "--", "--", "--"];
    ["d", "h", "m", "s"].forEach((id, i) => {
      const el = $(id);
      if (el) el.textContent = typeof vals[i] === "number" ? String(vals[i]).padStart(2, "0") : vals[i];
    });
  }

  // ---- 渲染 ----
  function render() {
    events.sort((a, b) => new Date(b.at) - new Date(a.at));
    const last = events.find((e) => e.type === "global");

    if (last) {
      const anchor = new Date(last.at);
      predStart = addDays(anchor, 4);
      predEnd = addDays(anchor, 7);
      target = predEnd.getTime();

      $("predRange").textContent = `${fmtDate(predStart)}（${fmtWeekday(predStart)}）— ${fmtDate(predEnd)}（${fmtWeekday(predEnd)}）`;
      $("lastReset").textContent = fmtFull(last.at);
      $("lastResetLink").href = last.url;
      $("daysAgo").textContent = Math.max(0, Math.floor((Date.now() - anchor) / 864e5)) + " " + T.daysAgo;
    }

    // 历史表
    const tbody = $("historyBody");
    if (tbody) {
      tbody.innerHTML = events
        .map((e) => {
          const isGlobal = e.type === "global";
          return `<tr>
            <td data-label="时间">${esc(fmtFull(e.at))}</td>
            <td data-label="类型"><span class="tag ${isGlobal ? "global" : "banked"}">${isGlobal ? T.global : T.banked}</span></td>
            <td data-label="内容">${esc(e.text)}</td>
            <td data-label="原文"><a href="${esc(e.url)}" target="_blank" rel="noreferrer">${T.view}</a></td>
          </tr>`;
        })
        .join("");
    }

    if ($("eventCount")) $("eventCount").textContent = events.length;
    if ($("globalCount")) $("globalCount").textContent = events.filter((e) => e.type === "global").length;

    tick();
  }

  // ---- 加载数据 ----
  async function load() {
    try {
      const r = await fetch(DATA_URL, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const list = (data.events || data).filter((e) => e && e.at);
      if (list.length) events = list;
    } catch (err) {
      console.warn("events.json 加载失败", err);
    }
    render();
  }

  // ---- 初始化 ----
  document.addEventListener("DOMContentLoaded", () => {
    const icsBtn = $("icsBtn");
    if (icsBtn) icsBtn.addEventListener("click", downloadICS);
    load();
    setInterval(tick, 1000);
  });
})();

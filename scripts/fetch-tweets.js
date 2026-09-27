// GitHub Actions: 抓取 Tibo 最新推文并更新 events.json
// 环境变量: TWITTER_BEARER_TOKEN
const fs = require("fs");
const path = require("path");

const EVENTS_PATH = path.join(__dirname, "..", "events.json");
const TIBO_USERNAME = "thsottiaux";
const API_BASE = "https://api.twitter.com/2";

// ========== 推文分类（与 js/main.js 的 classifyTweet 保持一致）==========
function classifyType(text) {
  const t = text.toLowerCase();
  // banked reset 更具体，优先判断
  if (/banked reset|bank reset/i.test(t)) {
    return "banked";
  }
  if (/reset all|all reset|global reset|reset.*everyone|reset.*all|usage.*reset|rate.*limit.*reset/i.test(t)) {
    return "global";
  }
  // 其他类型不录入（只关注重置相关）
  return null;
}

async function apiGet(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twitter API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function getUserId(username, token) {
  const data = await apiGet(
    `${API_BASE}/users/by/username/${encodeURIComponent(username)}`,
    token
  );
  return data.data.id;
}

async function getRecentTweets(userId, token) {
  // 取最近 100 条推文，排除转发和回复
  const params = new URLSearchParams({
    max_results: "100",
    exclude: "retweets,replies",
    "tweet.fields": "created_at,id,text",
  });
  const data = await apiGet(
    `${API_BASE}/users/${userId}/tweets?${params}`,
    token
  );
  return data.data || [];
}

function main() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    console.error("错误: 未设置 TWITTER_BEARER_TOKEN 环境变量");
    process.exit(1);
  }

  (async () => {
    const raw = fs.readFileSync(EVENTS_PATH, "utf8");
    const eventsData = JSON.parse(raw);
    const existingIds = new Set(eventsData.events.map((e) => e.id));

    console.log(`现有 ${eventsData.events.length} 条记录`);

    const userId = await getUserId(TIBO_USERNAME, token);
    console.log(`Tibo 用户 ID: ${userId}`);

    const tweets = await getRecentTweets(userId, token);
    console.log(`获取到 ${tweets.length} 条最新推文`);

    let added = 0;
    for (const tw of tweets) {
      if (existingIds.has(tw.id)) continue;

      const type = classifyType(tw.text);
      if (!type) continue; // 只录入重置相关推文

      eventsData.events.push({
        id: tw.id,
        at: tw.created_at,
        type,
        text: tw.text,
        url: `https://x.com/${TIBO_USERNAME}/status/${tw.id}`,
      });
      added++;
      console.log(`+ 新增 [${type}] ${tw.id}: ${tw.text.slice(0, 60)}...`);
    }

    if (added === 0) {
      console.log("没有新的重置相关推文，无需更新");
      return;
    }

    // 按时间倒序排序
    eventsData.events.sort(
      (a, b) => new Date(b.at) - new Date(a.at)
    );
    eventsData.updated_at = new Date().toISOString();

    fs.writeFileSync(EVENTS_PATH, JSON.stringify(eventsData, null, 2) + "\n");
    console.log(`更新完成，共新增 ${added} 条，当前总数 ${eventsData.events.length}`);
  })().catch((err) => {
    console.error("执行失败:", err.message);
    process.exit(1);
  });
}

main();

// 批量生成 SEO 内容落地页：报错类 / 规则类 / 数量类 / 操作类
// 运行：node _generate_content.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CSS = "content.css";
const JS = "content.js";

// ============ 内容数据（中 / 英 / 日） ============
const PAGES = {
  // ---------- 报错类 ----------
  errors: [
    {
      slug: "out-of-messages",
      errorText: "You've reached the message limit for today. Try again tomorrow.",
      errorOrigin: "Claude / ChatGPT 网页版常见提示",
      titles: {
        zh: "You've reached the message limit — 消息额度用完怎么办？",
        en: "You've reached the message limit — What to do when you run out of messages",
        ja: "You've reached the message limit — メッセージ枠が尽きた時の対処法"
      },
      descs: {
        zh: "遇到「You've reached the message limit for today」报错？本文解释消息限额用完的含义、重置时间规律，以及临时替代方案。",
        en: "Hit the 'You've reached the message limit for today' error? Learn what it means, when limits reset, and what to do until they refresh.",
        ja: "「You've reached the message limit for today」エラーが出たら？枠の意味、リセット時間、一時的な代替手段を解説。"
      },
      bodies: {
        zh: {
          sub: "当你看到这条提示，说明当前账号今日的消息调用次数已用完。限额按账户等级和厂商策略每日自动重置，本文帮你理解机制并找到可行方案。",
          sections: [
            { h: "这条报错是什么意思", p: "「You've reached the message limit for today」表示你在当前计费周期内的消息发送次数已达到上限。厂商为防止滥用和控制成本，会按天（或按月）对免费/订阅用户设置调用上限。" },
            { h: "额度什么时候重置", p: "不同产品的重置时间不同：Claude 网页版通常按 UTC 零点重置；ChatGPT 按账号时区或太平洋时间重置；部分产品按账号首次使用时间滚动 24 小时重置。具体以官方说明为准。" },
            { h: "临时解决方案", items: ["切换到另一个账号继续使用", "使用 API 版本（额度独立于网页版）", "等待重置窗口结束后再使用", "升级到更高等级订阅以获得更多额度"] },
            { h: "常见问题", faqs: [
              { q: "为什么我的额度比别人少？", a: "不同账号等级（Free / Pro / Max）的额度不同，部分账号还处于灰度测试阶段，额度配置会有差异。" },
              { q: "重置后额度会累积吗？", a: "通常不会。每日额度当日有效，未使用部分不会结转到次日。" }
            ]}
          ]
        },
        en: {
          sub: "Seeing this message means your account has used up its daily message quota. Limits reset automatically on a schedule set by each provider.",
          sections: [
            { h: "What this error means", p: "'You've reached the message limit for today' means you've hit the maximum number of messages allowed in the current billing cycle. Providers cap usage to prevent abuse and manage costs." },
            { h: "When do limits reset", p: "Reset times vary by product: Claude web typically resets at UTC midnight; ChatGPT resets based on account timezone or Pacific Time; some products roll on a 24-hour window from first use. Check official docs for specifics." },
            { h: "Temporary workarounds", items: ["Switch to another account", "Use the API version (quota is separate from web)", "Wait for the reset window to end", "Upgrade to a higher subscription tier"] },
            { h: "FAQ", faqs: [
              { q: "Why is my quota lower than others?", a: "Different tiers (Free / Pro / Max) have different limits, and some accounts are in beta with varying configurations." },
              { q: "Does unused quota roll over?", a: "Usually not. Daily quotas expire at the end of the day and don't carry over." }
            ]}
          ]
        },
        ja: {
          sub: "このメッセージが表示された場合、アカウントの1日あたりのメッセージ枠を使い切ったことを意味します。枠は各サービスが定めたスケジュールで自動リセットされます。",
          sections: [
            { h: "このエラーの意味", p: "「You've reached the message limit for today」は、現在の課金周期内で送信できるメッセージ数の上限に達したことを意味します。各社は乱用防止とコスト管理のため、利用枠を設定しています。" },
            { h: "枠のリセット時間", p: "リセット時間はサービスによって異なります。Claude Webは通常UTC午前0時、ChatGPTはアカウントのタイムゾーンまたは太平洋時間、一部サービスは初回利用から24時間ごとにリセットされます。" },
            { h: "一時的な対処法", items: ["別のアカウントに切り替える", "API版を使う（Web版と枠は別）", "リセットまで待つ", "上位プランにアップグレードする"] },
            { h: "よくある質問", faqs: [
              { q: "なぜ自分の枠が少ないの？", a: "プラン（Free / Pro / Max）によって枠が異なります。ベータ版アカウントは設定が異なる場合があります。" },
              { q: "余った枠は繰り越せる？", a: "通常はできません。1日ごとの枠はその日で失効します。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "../limits/pro-daily-limit.html", title: { zh: "Pro 每日额度", en: "Pro Daily Limit", ja: "Pro の1日枠" } },
        { slug: "../guides/how-to-check-usage.html", title: { zh: "怎么看剩余额度", en: "How to check usage", ja: "残り枠の確認方法" } }
      ]
    },
    {
      slug: "message-limit",
      errorText: "Message limit reached. Please wait for the reset.",
      errorOrigin: "通用型 AI 助手限额提示",
      titles: {
        zh: "Message limit reached — 消息限额已达上限",
        en: "Message limit reached — You've hit your message quota",
        ja: "Message limit reached — メッセージ枠の上限に到達"
      },
      descs: {
        zh: "「Message limit reached」报错详解：消息限额达到上限的原因、重置周期计算方式，以及如何合理分配每日额度。",
        en: "Learn why you see 'Message limit reached', how reset cycles work, and how to budget your daily message quota effectively.",
        ja: "「Message limit reached」が表示される理由、リセット周期の計算方法、1日の枠を上手に使うコツを解説。"
      },
      bodies: {
        zh: {
          sub: "消息限额是厂商控制单用户调用频率的核心机制。达到上限后，部分功能会被锁定直到下一个重置周期。",
          sections: [
            { h: "为什么会触发限额", p: "当你在较短时间内发送大量消息，或当日累计消息数达到账户等级上限时，就会触发此提示。这是厂商防止滥用和保障服务稳定性的正常机制。" },
            { h: "重置周期怎么算", p: "多数产品采用「自然日」重置（按 UTC 或指定时区零点），部分采用「滚动 24 小时」（从你最后一次使用起算 24 小时）。具体规则可在账户设置或官方文档中查看。" },
            { h: "如何避免频繁触限", items: ["合并多个问题到一条消息中", "使用更长的上下文窗口减少往返", "错开高峰时段使用", "关注官方发布的重置时间，提前规划"] },
            { h: "常见问题", faqs: [
              { q: "被限后还能用什么功能？", a: "通常基础对话不可用，但历史记录浏览、文件管理等功能可能仍可使用。API 调用不受网页版限额影响。" }
            ]}
          ]
        },
        en: {
          sub: "Message limits are the core mechanism providers use to control per-user call frequency. Once reached, some features are locked until the next reset cycle.",
          sections: [
            { h: "Why you hit the limit", p: "This appears when you send many messages in a short time, or when your daily total reaches your account tier's cap. It's a normal anti-abuse and stability measure." },
            { h: "How reset cycles work", p: "Most products reset on a 'calendar day' (UTC or a specific timezone midnight), while some use a 'rolling 24-hour' window from your last use. Check account settings or official docs for specifics." },
            { h: "How to avoid hitting limits often", items: ["Combine multiple questions into one message", "Use longer context windows to reduce round-trips", "Use during off-peak hours", "Track official reset times and plan ahead"] },
            { h: "FAQ", faqs: [
              { q: "What still works when limited?", a: "Basic chat is usually locked, but history browsing and file management may still work. API calls are not affected by web limits." }
            ]}
          ]
        },
        ja: {
          sub: "メッセージ枠は、各社がユーザーごとの利用頻度を制御するための主要な仕組みです。上限に達すると、次のリセット周期まで一部機能が制限されます。",
          sections: [
            { h: "枠に達する理由", p: "短時間に大量のメッセージを送信したり、1日の累計がアカウントの上限に達したりすると表示されます。乱用防止と安定性確保のための正常な仕組みです。" },
            { h: "リセット周期の計算", p: "多くのサービスは「暦日」ベース（UTCまたは特定タイムゾーンの午前0時）でリセットしますが、「24時間ローリング」（最終利用から24時間後）の場合もあります。" },
            { h: "頻繁に枠を切らさないコツ", items: ["複数の質問を1つのメッセージにまとめる", "長いコンテキストウィンドウを使って往復を減らす", "混雑時間を避ける", "公式のリセット時間を把握して計画する"] },
            { h: "よくある質問", faqs: [
              { q: "制限中でも使える機能は？", a: "基本的なチャットは制限されますが、履歴閲覧やファイル管理は使える場合があります。API呼び出しはWeb版の枠の影響を受けません。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "out-of-messages.html", title: { zh: "out of messages 报错", en: "out of messages error", ja: "out of messages エラー" } },
        { slug: "../guides/how-to-switch-account.html", title: { zh: "怎么切换账号", en: "How to switch accounts", ja: "アカウント切り替え方法" } }
      ]
    },
    {
      slug: "usage-capped",
      errorText: "Usage cap reached. Your access will be restored shortly.",
      errorOrigin: "API / 高级功能限额提示",
      titles: {
        zh: "Usage cap reached — 用量上限已达，如何恢复访问",
        en: "Usage cap reached — How to restore access after hitting the limit",
        ja: "Usage cap reached — 利用上限到達後の復旧方法"
      },
      descs: {
        zh: "「Usage cap reached」报错说明：API 或高级功能用量达到上限后的处理方式、自动恢复时间，以及如何申请提升限额。",
        en: "What to do when you see 'Usage cap reached' — automatic recovery times, how to request limit increases, and best practices.",
        ja: "「Usage cap reached」が出た時の対処法 — 自動復旧時間、枠の引き上げ申請方法、ベストプラクティス。"
      },
      bodies: {
        zh: {
          sub: "「Usage cap reached」通常出现在 API 调用或高级功能（如长上下文、图片生成）达到用量上限时。",
          sections: [
            { h: "和消息限额的区别", p: "消息限额（message limit）针对对话次数，而 usage cap 针对资源消耗量（如 token 数、计算时长、生成次数）。后者通常额度更大，但消耗也更快。" },
            { h: "自动恢复时间", p: "达到 usage cap 后，系统会在当前计费周期结束时自动恢复。按日重置的通常在 24 小时内恢复，按月重置的则需等到月底。" },
            { h: "如何申请提升限额", items: ["在账户设置中提交限额提升申请", "联系客服说明使用场景和需求", "升级到更高等级订阅", "加入企业版获得定制配额"] },
            { h: "常见问题", faqs: [
              { q: "被限后已经发送的请求会丢失吗？", a: "已完成的请求结果会保留，未完成的请求会被中断并返回错误，不会丢失已有数据。" }
            ]}
          ]
        },
        en: {
          sub: "'Usage cap reached' typically appears when API calls or advanced features (long context, image generation) hit their consumption limit.",
          sections: [
            { h: "Difference from message limits", p: "Message limits cap conversation turns, while usage caps cap resource consumption (token count, compute time, generation count). Usage caps are usually higher but deplete faster." },
            { h: "Automatic recovery time", p: "After hitting a usage cap, access is automatically restored at the end of the current billing cycle. Daily caps recover within 24 hours; monthly caps wait until month-end." },
            { h: "How to request a limit increase", items: ["Submit a limit increase request in account settings", "Contact support with your use case and needs", "Upgrade to a higher subscription tier", "Join Enterprise for custom quotas"] },
            { h: "FAQ", faqs: [
              { q: "Do in-flight requests get lost?", a: "Completed results are preserved. Unfinished requests are interrupted and return an error — no existing data is lost." }
            ]}
          ]
        },
        ja: {
          sub: "「Usage cap reached」は通常、API呼び出しや高度機能（長文コンテキスト、画像生成など）が消費枠の上限に達した時に表示されます。",
          sections: [
            { h: "メッセージ枠との違い", p: "メッセージ枠は会話回数を制限しますが、usage capはリソース消費量（トークン数、計算時間、生成回数）を制限します。後者は通常枠が大きいですが、消費も速いです。" },
            { h: "自動復旧時間", p: "usage capに達すると、現在の課金周期が終了すると自動的に復旧します。日次リセットなら24時間以内、月次リセットなら月末まで待つ必要があります。" },
            { h: "枠の引き上げ申請方法", items: ["アカウント設定で枠引き上げを申請する", "利用シーンと要件を添えてサポートに連絡する", "上位プランにアップグレードする", "Enterprise版でカスタム枠を得る"] },
            { h: "よくある質問", faqs: [
              { q: "実行中のリクエストは消える？", a: "完了済みの結果は保持されます。未完了のリクエストは中断されエラーが返りますが、既存データが失われることはありません。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "../limits/max-limit.html", title: { zh: "Max 等级额度", en: "Max tier limit", ja: "Max プランの枠" } },
        { slug: "message-limit.html", title: { zh: "message limit 报错", en: "message limit error", ja: "message limit エラー" } }
      ]
    }
  ],

  // ---------- 规则类 ----------
  rules: [
    {
      slug: "thinking-counts-toward-limit",
      titles: {
        zh: "Thinking 模式算不算额度？深度解析用量计算规则",
        en: "Does thinking mode count toward your limit? Usage calculation rules explained",
        ja: "Thinkingモードは枠に含まれる？利用量計算ルールを解説"
      },
      descs: {
        zh: "Thinking 模式（深度思考）是否消耗消息额度？官方规则解读：思考 token 如何计费、是否占用每日限额、实测数据对比。",
        en: "Does thinking (deep reasoning) mode consume your message quota? Official rules on how thinking tokens are billed and whether they count toward daily limits.",
        ja: "Thinking（推論）モードはメッセージ枠を消費する？思考トークンの課金ルールと1日枠への影響を解説。"
      },
      bodies: {
        zh: {
          sub: "Thinking 模式会消耗更多 token 进行内部推理，但这些思考过程是否计入你的消息限额，取决于厂商的计费策略。",
          sections: [
            { h: "Thinking 模式的工作原理", p: "Thinking 模式让模型在生成最终回答前，先进行多轮内部推理（产生大量不可见的思考 token），以提升复杂任务的准确性。这些思考 token 会显著增加单次请求的总 token 消耗。" },
            { h: "是否计入消息限额", p: "根据多数厂商的当前规则，Thinking 模式产生的思考 token 会计入 API 的 token 用量计费，但在网页版中通常只占用一次消息次数（不论思考多少轮）。也就是说：一次 thinking 回复 = 一次消息额度消耗。" },
            { h: "对额度的实际影响", items: ["网页版：每次使用 thinking 模式消耗 1 次消息额度，与普通模式相同", "API 版：thinking token 按实际 token 数计费，成本可能是普通模式的 2-5 倍", "长思考链会显著增加延迟，但不额外消耗消息次数"] },
            { h: "常见问题", faqs: [
              { q: "可以关闭 thinking 节省额度吗？", a: "可以。多数产品支持在设置中关闭深度思考模式，以降低 token 消耗和延迟，但复杂任务的准确率可能下降。" },
              { q: "thinking 的输出内容算 token 吗？", a: "算。可见的最终回答和不可见的思考过程都消耗 token，但只有最终回答展示给用户。" }
            ]}
          ]
        },
        en: {
          sub: "Thinking mode consumes more tokens for internal reasoning, but whether these count toward your message limit depends on each provider's billing strategy.",
          sections: [
            { h: "How thinking mode works", p: "Thinking mode lets the model perform multiple rounds of internal reasoning (producing many hidden thinking tokens) before generating the final answer, improving accuracy on complex tasks. These thinking tokens significantly increase the total token cost per request." },
            { h: "Does it count toward message limits", p: "Under most providers' current rules, thinking tokens count toward API token billing, but in the web version they typically consume only one message turn (regardless of how many reasoning rounds). So: one thinking reply = one message quota." },
            { h: "Practical impact on quota", items: ["Web: each thinking-mode use consumes 1 message turn, same as normal mode", "API: thinking tokens are billed by actual token count, costing 2-5x normal mode", "Long reasoning chains increase latency but don't consume extra message turns"] },
            { h: "FAQ", faqs: [
              { q: "Can I turn off thinking to save quota?", a: "Yes. Most products let you disable deep reasoning in settings to reduce token cost and latency, though accuracy on complex tasks may drop." },
              { q: "Do thinking outputs count as tokens?", a: "Yes. Both the visible final answer and hidden reasoning consume tokens, but only the final answer is shown to the user." }
            ]}
          ]
        },
        ja: {
          sub: "Thinkingモードは内部推論のためにより多くのトークンを消費しますが、これらがメッセージ枠に含まれるかは各社の課金方針に依存します。",
          sections: [
            { h: "Thinkingモードの仕組み", p: "Thinkingモードでは、最終回答を生成する前にモデルが複数ラウンドの内部推論（非表示の思考トークンを大量に生成）を行い、複雑なタスクの精度を向上させます。" },
            { h: "メッセージ枠への影響", p: "多くのサービスの現在のルールでは、thinkingトークンはAPIのトークン課金に含まれますが、Web版では通常1回のメッセージ枠しか消費しません（推論ラウンド数に関わらず）。" },
            { h: "実際の枠への影響", items: ["Web版：thinkingモードは通常モードと同じく1回のメッセージ枠を消費", "API版：thinkingトークンは実トークン数で課金され、通常モードの2〜5倍のコスト", "長い推論は遅延が増えるが、メッセージ回数は追加消費しない"] },
            { h: "よくある質問", faqs: [
              { q: "枠を節約するためにthinkingをオフにできる？", a: "はい。多くのサービスで設定から推論モードをオフにできます。トークン消費と遅延は減りますが、複雑なタスクの精度が下がる可能性があります。" },
              { q: "thinkingの出力はトークンに含まれる？", a: "はい。表示される最終回答と非表示の思考プロセスの両方がトークンを消費しますが、ユーザーに表示されるのは最終回答のみです。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "subagent-usage.html", title: { zh: "Subagent 算不算额度", en: "Does subagent count", ja: "Subagent は枠に含まれる？" } },
        { slug: "cache-counts.html", title: { zh: "Cache 算不算额度", en: "Does cache count", ja: "キャッシュは枠に含まれる？" } }
      ]
    },
    {
      slug: "subagent-usage",
      titles: {
        zh: "Subagent（子代理）调用算不算额度？用量分摊规则",
        en: "Does subagent (child agent) usage count toward your limit? Quota sharing rules",
        ja: "Subagent（子エージェント）の利用は枠に含まれる？枠の共有ルール"
      },
      descs: {
        zh: "Subagent 子代理调用是否独立计费？主账号与子代理的额度分摊规则、调用链中的用量计算方式详解。",
        en: "Are subagent calls billed separately? Learn how quota is shared between main account and subagents, and how usage is calculated across call chains.",
        ja: "Subagentの呼び出しは別課金？メインアカウントと子エージェントの枠共有ルールと、呼び出しチェーン全体の利用量計算を解説。"
      },
      bodies: {
        zh: {
          sub: "当主账号发起任务并调用 Subagent 时，产生的用量如何在主账号和子代理之间分摊，是很多用户关心的问题。",
          sections: [
            { h: "Subagent 的调用机制", p: "Subagent 是主账号下创建的子代理，可独立执行子任务。调用时主账号会发起请求，子代理在沙箱环境中运行，最终将结果返回主账号。整个调用链可能包含多轮 LLM 交互。" },
            { h: "用量如何计算", p: "根据当前主流实现，Subagent 产生的所有 LLM 调用用量统一计入主账号的额度。子代理本身没有独立额度，它消耗的是主账号的配额。" },
            { h: "实际影响", items: ["一次主账号请求可能触发多个 Subagent 调用，消耗多倍消息额度", "Subagent 的 thinking 和工具调用 token 全部计入主账号", "长任务链可能快速耗尽主账号的每日额度"] },
            { h: "常见问题", faqs: [
              { q: "Subagent 失败了还扣额度吗？", a: "扣。只要 LLM 调用发生，无论任务成功或失败，已消耗的 token 和消息次数都会计入额度。" },
              { q: "可以限制 Subagent 的用量吗？", a: "部分平台支持设置单任务的 token 上限和最大调用轮次，建议配置以避免意外超额。" }
            ]}
          ]
        },
        en: {
          sub: "When a main account launches a task and calls Subagents, how usage is split between the main account and subagents is a common concern.",
          sections: [
            { h: "How subagent calls work", p: "Subagents are child agents created under a main account that can independently execute subtasks. The main account initiates the request, subagents run in a sandboxed environment, and results flow back to the main account. The full chain may include multiple LLM interactions." },
            { h: "How usage is calculated", p: "Under current mainstream implementations, all LLM usage generated by subagents is charged to the main account's quota. Subagents have no independent quota; they consume the main account's allocation." },
            { h: "Practical impact", items: ["One main-account request may trigger multiple subagent calls, consuming multiple message turns", "Subagent thinking and tool-call tokens all count toward the main account", "Long task chains can quickly exhaust the main account's daily quota"] },
            { h: "FAQ", faqs: [
              { q: "Is quota consumed if a subagent fails?", a: "Yes. Any LLM call that actually executes — whether the task succeeds or fails — consumes tokens and message turns." },
              { q: "Can I limit subagent usage?", a: "Some platforms let you set per-task token caps and max call rounds. Configure these to avoid unexpected overages." }
            ]}
          ]
        },
        ja: {
          sub: "メインアカウントがタスクを開始してSubagentを呼び出す際、利用量がメインアカウントと子エージェント間でどう分配されるかは多くのユーザーが関心を持つ点です。",
          sections: [
            { h: "Subagent呼び出しの仕組み", p: "Subagentはメインアカウント配下に作成される子エージェントで、サブタスクを独立して実行できます。メインアカウントがリクエストを開始し、Subagentがサンドボックス環境で実行、結果がメインアカウントに返ります。" },
            { h: "利用量の計算", p: "現在の主流な実装では、Subagentが生成するすべてのLLM利用量はメインアカウントの枠に計上されます。Subagent自体に独立した枠はなく、メインアカウントの枠を消費します。" },
            { h: "実際の影響", items: ["1回のメインリクエストが複数のSubagent呼び出しを引き起こし、複数倍のメッセージ枠を消費", "Subagentのthinkingやツール呼び出しトークンはすべてメインアカウントに計上", "長いタスクチェーンはメインアカウントの1日枠をすぐに使い果たす可能性がある"] },
            { h: "よくある質問", faqs: [
              { q: "Subagentが失敗しても枠は消費される？", a: "はい。LLM呼び出しが実行された時点で、タスクの成否に関わらず消費されたトークンとメッセージ回数は枠に計上されます。" },
              { q: "Subagentの利用量を制限できる？", a: "一部のプラットフォームではタスクごとのトークン上限や最大呼び出しラウンドを設定できます。意図しない超過を防ぐために設定を推奨します。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "thinking-counts-toward-limit.html", title: { zh: "Thinking 算不算额度", en: "Does thinking count", ja: "Thinking は枠に含まれる？" } },
        { slug: "../limits/pro-daily-limit.html", title: { zh: "Pro 每日额度", en: "Pro daily limit", ja: "Pro の1日枠" } }
      ]
    },
    {
      slug: "cache-counts",
      titles: {
        zh: "Cache（缓存）命中算不算额度？Prompt Caching 计费规则",
        en: "Does cache (prompt caching) hit count toward your limit? Caching billing rules",
        ja: "キャッシュ（プロンプトキャッシング）ヒットは枠に含まれる？キャッシュ課金ルール"
      },
      descs: {
        zh: "Prompt Caching 缓存命中是否还消耗 token？缓存计费折扣规则、命中条件、以及对每日额度的影响。",
        en: "Does a prompt cache hit still consume tokens? Caching discount rules, hit conditions, and impact on daily quota explained.",
        ja: "プロンプトキャッシュヒットはトークンを消費する？キャッシュ割引ルール、ヒット条件、1日枠への影響を解説。"
      },
      bodies: {
        zh: {
          sub: "Prompt Caching 是厂商提供的一种优化：相同的 prompt 前缀被缓存后，后续命中时 token 费用大幅降低，但仍然会被计入用量。",
          sections: [
            { h: "缓存命中如何计费", p: "当 prompt 的前 N 个 token 与已缓存内容完全匹配时，命中部分通常按正常价格的 10%-25% 计费（具体折扣因厂商而异）。未命中的部分仍按原价计费。" },
            { h: "是否计入消息限额", p: "在网页版中，缓存命中不影响消息次数（仍然是一次消息 = 一次额度消耗）。在 API 版中，缓存命中的 token 会按折扣价计入用量，但不会减少消息次数计数。" },
            { h: "如何提高缓存命中率", items: ["将固定的系统提示词（system prompt）放在请求开头", "保持上下文结构稳定，避免频繁变动前置内容", "注意缓存有效期（通常 5 分钟 - 1 小时）", "长对话中尽量复用相同的前缀结构"] },
            { h: "常见问题", faqs: [
              { q: "缓存命中能省多少钱？", a: "对于重复使用大段系统提示的场景，缓存命中可节省 50%-90% 的 token 费用，具体取决于命中率和缓存折扣率。" },
              { q: "缓存会影响回答质量吗？", a: "不会。缓存只影响计费和速度，模型生成的内容质量与未缓存时完全一致。" }
            ]}
          ]
        },
        en: {
          sub: "Prompt Caching is an optimization where repeated prompt prefixes are cached, and subsequent hits cost much less — but the usage is still counted.",
          sections: [
            { h: "How cache hits are billed", p: "When the first N tokens of a prompt exactly match cached content, the hit portion is typically billed at 10%-25% of the normal price (discount varies by provider). Unmatched portions are billed at full price." },
            { h: "Does it count toward message limits", p: "In the web version, cache hits don't affect message count (still one message = one quota). In the API, cached-hit tokens count toward usage at the discounted rate, but don't reduce message-turn count." },
            { h: "How to improve cache hit rate", items: ["Place fixed system prompts at the start of requests", "Keep context structure stable, avoid changing prefixes frequently", "Be aware of cache TTL (usually 5 min - 1 hour)", "Reuse the same prefix structure in long conversations"] },
            { h: "FAQ", faqs: [
              { q: "How much can caching save?", a: "For workloads with large repeated system prompts, cache hits can save 50%-90% of token costs, depending on hit rate and discount." },
              { q: "Does caching affect answer quality?", a: "No. Caching only affects billing and speed — model output quality is identical to uncached requests." }
            ]}
          ]
        },
        ja: {
          sub: "プロンプトキャッシングは、繰り返し使われるプロンプトのプレフィックスをキャッシュし、ヒット時のコストを大幅に削減する最適化機能です。ただし利用量自体は計上されます。",
          sections: [
            { h: "キャッシュヒットの課金", p: "プロンプトの先頭Nトークンがキャッシュと完全一致した場合、ヒット部分は通常価格の10〜25%で課金されます（割引率はサービスにより異なる）。不一致部分は通常価格で課金されます。" },
            { h: "メッセージ枠への影響", p: "Web版ではキャッシュヒットはメッセージ回数に影響しません（1メッセージ = 1枠）。API版ではキャッシュヒットのトークンは割引価格で利用量に計上されますが、メッセージ回数は減りません。" },
            { h: "キャッシュヒット率を上げるには", items: ["固定のシステムプロンプトをリクエストの先頭に配置する", "コンテキスト構造を安定させ、プレフィックスの頻繁な変更を避ける", "キャッシュの有効期限（通常5分〜1時間）に注意する", "長い会話では同じプレフィックス構造を再利用する"] },
            { h: "よくある質問", faqs: [
              { q: "キャッシュでどれくらい節約できる？", a: "大きなシステムプロンプトを繰り返し使うケースでは、ヒット率と割引率にもよりますが、トークンコストを50〜90%削減できる場合があります。" },
              { q: "キャッシュは回答品質に影響する？", a: "いいえ。キャッシュは課金と速度にのみ影響し、モデルの出力品質は非キャッシュ時と完全に同じです。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "thinking-counts-toward-limit.html", title: { zh: "Thinking 算不算额度", en: "Does thinking count", ja: "Thinking は枠に含まれる？" } },
        { slug: "../limits/max-limit.html", title: { zh: "Max 等级额度", en: "Max tier limit", ja: "Max プランの枠" } }
      ]
    }
  ],

  // ---------- 数量类 ----------
  limits: [
    {
      slug: "pro-daily-limit",
      titles: {
        zh: "Pro 每日额度多少？消息限制与用量数据一览",
        en: "What is the Pro daily limit? Message caps and usage data overview",
        ja: "Proの1日あたりの枠は？メッセージ制限と利用データ一覧"
      },
      descs: {
        zh: "Codex / Claude / ChatGPT Pro 订阅的每日消息额度是多少？本文整理各产品 Pro 等级的限额数据、历史变更记录和重置时间。",
        en: "What's the daily message limit for Pro subscriptions? A breakdown of Pro-tier quotas across products, historical changes, and reset times.",
        ja: "Proサブスクリプションの1日あたりメッセージ枠は？各サービスのProプラン枠、履歴変更、リセット時間をまとめました。"
      },
      dataTable: {
        zh: { headers: ["产品", "每日消息额度", "重置时间", "备注"], rows: [
          ["Claude Pro", "约 50 条", "UTC 00:00", "含 opus / sonnet 切换"],
          ["ChatGPT Pro", "约 50 条", "PT 00:00", "模型切换共享额度"],
          ["Codex Pro", "约 80 条", "滚动 24h", "含 thinking 模式"],
          ["Gemini Pro", "约 50 条", "PT 00:00", "含图片生成"]
        ]},
        en: { headers: ["Product", "Daily Messages", "Reset Time", "Notes"], rows: [
          ["Claude Pro", "~50 turns", "UTC 00:00", "Includes opus / sonnet switching"],
          ["ChatGPT Pro", "~50 turns", "PT 00:00", "Shared across model switches"],
          ["Codex Pro", "~80 turns", "Rolling 24h", "Includes thinking mode"],
          ["Gemini Pro", "~50 turns", "PT 00:00", "Includes image generation"]
        ]},
        ja: { headers: ["サービス", "1日メッセージ枠", "リセット時間", "備考"], rows: [
          ["Claude Pro", "約50回", "UTC 00:00", "opus / sonnet 切替含む"],
          ["ChatGPT Pro", "約50回", "PT 00:00", "モデル切替で枠共有"],
          ["Codex Pro", "約80回", "24時間ローリング", "thinkingモード含む"],
          ["Gemini Pro", "約50回", "PT 00:00", "画像生成含む"]
        ]}
      },
      bodies: {
        zh: {
          sub: "Pro 等级是大多数重度用户的选择。各厂商的 Pro 每日额度在 50-80 条消息之间，具体数值会随厂商策略调整。",
          sections: [
            { h: "额度说明", p: "Pro 订阅的每日消息额度通常在 50-80 条之间。额度为所有模型共享，切换不同模型不会增加可用次数。长上下文和 thinking 模式不额外消耗次数，但可能影响 token 用量。" },
            { h: "历史变更记录", items: ["2025-06：多家厂商将 Pro 额度从 40 条提升至 50 条", "2025-09：部分产品引入滚动 24 小时重置机制", "2026-03：Codex Pro 额度提升至 80 条"] },
            { h: "如何最大化利用", items: ["合并相关问题，减少消息往返", "善用长上下文，在一次对话中处理多个任务", "关注官方公告，及时了解额度调整", "使用 API 处理大批量任务，不占用网页额度"] }
          ]
        },
        en: {
          sub: "Pro tier is the choice for most heavy users. Daily limits range from 50-80 messages across providers, subject to policy changes.",
          sections: [
            { h: "About the quota", p: "Pro subscriptions typically include 50-80 daily messages. The quota is shared across all models — switching models doesn't add turns. Long context and thinking mode don't cost extra turns but may affect token usage." },
            { h: "Historical changes", items: ["2025-06: Most providers raised Pro limit from 40 to 50", "2025-09: Some products introduced rolling 24h reset", "2026-03: Codex Pro limit raised to 80"] },
            { h: "How to maximize usage", items: ["Combine related questions to reduce round-trips", "Use long context to handle multiple tasks in one conversation", "Follow official announcements for limit changes", "Use the API for batch tasks to save web quota"] }
          ]
        },
        ja: {
          sub: "Proプランはヘビーユーザーの大多数が選ぶプランです。各社のProの1日枠は50〜80回程度で、ポリシー変更により変動します。",
          sections: [
            { h: "枠について", p: "Proサブスクリプションには通常1日あたり50〜80回のメッセージ枠があります。枠は全モデルで共有され、モデルを切り替えても回数は増えません。" },
            { h: "履歴変更", items: ["2025-06：多くのサービスがPro枠を40回から50回に引き上げ", "2025-09：一部サービスが24時間ローリングリセットを導入", "2026-03：Codex Pro枠が80回に引き上げ"] },
            { h: "枠を最大限に活用するには", items: ["関連する質問をまとめて往復を減らす", "長いコンテキストを活用して1会話で複数タスクを処理", "公式アナウンスをフォローして枠変更を把握", "バッチ処理はAPIを使ってWeb枠を節約"] }
          ]
        }
      },
      related: [
        { slug: "max-limit.html", title: { zh: "Max 等级额度", en: "Max tier limit", ja: "Max プランの枠" } },
        { slug: "plus-limit.html", title: { zh: "Plus 等级额度", en: "Plus tier limit", ja: "Plus プランの枠" } }
      ]
    },
    {
      slug: "max-limit",
      titles: {
        zh: "Max 等级额度多少？最高订阅消息限制详解",
        en: "What is the Max tier limit? Top subscription message quota explained",
        ja: "Maxプランの枠は？最上位サブスクリプションのメッセージ制限を解説"
      },
      descs: {
        zh: "Max 等级（最高订阅）的每日消息额度是多少？与 Pro 的区别、额外权益、以及是否值得升级的对比分析。",
        en: "What's the daily message limit for the Max tier? Differences from Pro, extra benefits, and whether upgrading is worth it.",
        ja: "Maxプラン（最上位）の1日メッセージ枠は？Proとの違い、追加特典、アップグレードの価値を比較分析。"
      },
      dataTable: {
        zh: { headers: ["对比项", "Pro", "Max"], rows: [
          ["每日消息额度", "约 50-80 条", "约 200-500 条"],
          ["高级模型访问", "部分", "全部"],
          ["长上下文", "标准", "扩展"],
          ["优先队列", "否", "是"],
          ["月费", "$20", "$100-200"]
        ]},
        en: { headers: ["Feature", "Pro", "Max"], rows: [
          ["Daily messages", "~50-80", "~200-500"],
          ["Premium models", "Partial", "All"],
          ["Long context", "Standard", "Extended"],
          ["Priority queue", "No", "Yes"],
          ["Monthly price", "$20", "$100-200"]
        ]},
        ja: { headers: ["比較項目", "Pro", "Max"], rows: [
          ["1日メッセージ枠", "約50〜80回", "約200〜500回"],
          ["プレミアムモデル", "一部", "全部"],
          ["長文コンテキスト", "標準", "拡張"],
          ["優先キュー", "なし", "あり"],
          ["月額", "$20", "$100〜200"]
        ]}
      },
      bodies: {
        zh: {
          sub: "Max 是最高等级订阅，提供远高于 Pro 的消息额度和独家权益，适合重度专业用户。",
          sections: [
            { h: "Max 额度详解", p: "Max 等级通常提供每日 200-500 条消息额度，是 Pro 的 4-6 倍。此外还享有全部高级模型访问权、扩展上下文窗口、优先队列（高峰时段不排队）等权益。" },
            { h: "和 Pro 的核心区别", items: ["消息额度：Max 是 Pro 的 4-6 倍", "模型访问：Max 可使用所有最新模型", "上下文长度：Max 支持更长的上下文窗口", "响应速度：Max 享有优先处理队列"] },
            { h: "是否值得升级", p: "如果你每天使用 Pro 额度都接近上限，或者需要使用 Pro 不支持的高级模型（如最强推理模型），升级 Max 是值得的。对于轻度用户，Pro 的额度已足够。" }
          ]
        },
        en: {
          sub: "Max is the top subscription tier, offering far higher message limits and exclusive benefits for heavy professional users.",
          sections: [
            { h: "Max quota details", p: "The Max tier typically offers 200-500 daily messages, 4-6x that of Pro. It also includes access to all premium models, extended context windows, and a priority queue (no waiting during peak hours)." },
            { h: "Key differences from Pro", items: ["Message quota: Max is 4-6x Pro", "Model access: Max supports all latest models", "Context length: Max supports longer windows", "Speed: Max gets priority processing"] },
            { h: "Is it worth upgrading", p: "If you consistently hit Pro's daily cap or need premium models not available on Pro, upgrading to Max is worthwhile. For light users, Pro's quota is sufficient." }
          ]
        },
        ja: {
          sub: "Maxは最上位サブスクリプションプランで、Proをはるかに超えるメッセージ枠と専用特典を提供します。",
          sections: [
            { h: "Max枠の詳細", p: "Maxプランは通常1日あたり200〜500回のメッセージ枠を提供し、Proの4〜6倍です。さらに全プレミアムモデルへのアクセス、拡張コンテキストウィンドウ、優先キュー（ピーク時も待ちなし）などの特典があります。" },
            { h: "Proとの主な違い", items: ["メッセージ枠：MaxはProの4〜6倍", "モデルアクセス：Maxは全最新モデルに対応", "コンテキスト長：Maxはより長いウィンドウに対応", "速度：Maxは優先処理キューを利用可能"] },
            { h: "アップグレードの価値は", p: "Proの1日枠を毎日使い切る場合や、Proでは使えないプレミアムモデルが必要な場合は、Maxへのアップグレードを検討する価値があります。ライトユーザーにはProで十分です。" }
          ]
        }
      },
      related: [
        { slug: "pro-daily-limit.html", title: { zh: "Pro 每日额度", en: "Pro daily limit", ja: "Pro の1日枠" } },
        { slug: "plus-limit.html", title: { zh: "Plus 等级额度", en: "Plus tier limit", ja: "Plus プランの枠" } }
      ]
    },
    {
      slug: "plus-limit",
      titles: {
        zh: "Plus 等级额度多少？入门订阅消息限制说明",
        en: "What is the Plus tier limit? Entry subscription message quota explained",
        ja: "Plusプランの枠は？入門サブスクリプションのメッセージ制限を解説"
      },
      descs: {
        zh: "Plus 等级（入门订阅）的每日消息额度是多少？与免费版和 Pro 的区别、适合人群分析。",
        en: "What's the daily message limit for the Plus tier? Differences from Free and Pro, and who it's best for.",
        ja: "Plusプラン（入門）の1日メッセージ枠は？無料版・Proとの違いと、おすすめユーザー層を解説。"
      },
      dataTable: {
        zh: { headers: ["对比项", "免费版", "Plus", "Pro"], rows: [
          ["每日消息额度", "10-20 条", "30-40 条", "50-80 条"],
          ["高级模型", "受限", "部分", "较多"],
          ["高峰排队", "是", "部分", "否"],
          ["月费", "免费", "$10", "$20"]
        ]},
        en: { headers: ["Feature", "Free", "Plus", "Pro"], rows: [
          ["Daily messages", "10-20", "30-40", "50-80"],
          ["Premium models", "Limited", "Some", "More"],
          ["Peak queue", "Yes", "Partial", "No"],
          ["Monthly price", "Free", "$10", "$20"]
        ]},
        ja: { headers: ["比較項目", "無料版", "Plus", "Pro"], rows: [
          ["1日メッセージ枠", "10〜20回", "30〜40回", "50〜80回"],
          ["プレミアムモデル", "制限あり", "一部", "多め"],
          ["ピーク時待ち", "あり", "一部", "なし"],
          ["月額", "無料", "$10", "$20"]
        ]}
      },
      bodies: {
        zh: {
          sub: "Plus 是入门级订阅，在免费版基础上提升额度并解锁部分高级功能，适合中度用户。",
          sections: [
            { h: "Plus 额度说明", p: "Plus 等级通常提供每日 30-40 条消息额度，比免费版（10-20 条）多一倍左右。同时可解锁部分高级模型，并减少高峰时段的排队等待。" },
            { h: "适合人群", items: ["每天使用 AI 助手 30 分钟 - 2 小时的中度用户", "需要比免费版更多额度但预算有限的用户", "不需要 Pro 全部高级模型的用户", "学生和个人开发者"] },
            { h: "何时升级到 Pro", p: "当你频繁触发 Plus 额度上限，或需要使用 Pro 独有的高级模型（如最强推理模型）时，建议升级到 Pro。Pro 的额度约为 Plus 的 1.5-2 倍。" }
          ]
        },
        en: {
          sub: "Plus is the entry-level subscription, offering more quota than Free and unlocking some premium features — best for moderate users.",
          sections: [
            { h: "Plus quota details", p: "Plus typically offers 30-40 daily messages, roughly double the Free tier (10-20). It also unlocks some premium models and reduces peak-hour wait times." },
            { h: "Best for", items: ["Moderate users who use AI assistants 30 min - 2 hours daily", "Users who need more than Free but have a limited budget", "Those who don't need all of Pro's premium models", "Students and individual developers"] },
            { h: "When to upgrade to Pro", p: "Upgrade to Pro when you frequently hit Plus's limit or need Pro-only premium models (e.g., top-tier reasoning models). Pro's quota is about 1.5-2x that of Plus." }
          ]
        },
        ja: {
          sub: "Plusは入門サブスクリプションで、無料版より枠が多く一部プレミアム機能も解放されます。中程度の利用者に最適です。",
          sections: [
            { h: "Plus枠の詳細", p: "Plusは通常1日あたり30〜40回のメッセージ枠を提供し、無料版（10〜20回）の約2倍です。一部プレミアムモデルも解放され、ピーク時の待ち時間も短縮されます。" },
            { h: "おすすめユーザー", items: ["AIアシスタントを1日30分〜2時間使う中程度のユーザー", "無料版より枠が必要だが予算に限りがあるユーザー", "Proの全プレミアムモデルは必要ないユーザー", "学生や個人開発者"] },
            { h: "Proにアップグレードすべき時", p: "Plusの枠を頻繁に使い切る場合や、Pro専用のプレミアムモデル（最上位推論モデルなど）が必要な場合は、Proへのアップグレードを検討しましょう。Proの枠はPlusの約1.5〜2倍です。" }
          ]
        }
      },
      related: [
        { slug: "pro-daily-limit.html", title: { zh: "Pro 每日额度", en: "Pro daily limit", ja: "Pro の1日枠" } },
        { slug: "../errors/out-of-messages.html", title: { zh: "out of messages 报错", en: "out of messages error", ja: "out of messages エラー" } }
      ]
    }
  ],

  // ---------- 操作类 ----------
  guides: [
    {
      slug: "how-to-check-usage",
      titles: {
        zh: "怎么看剩余额度？各 AI 助手用量查询方法汇总",
        en: "How to check your remaining quota? Usage query methods for AI assistants",
        ja: "残り枠の確認方法は？各AIアシスタントの利用量確認方法まとめ"
      },
      descs: {
        zh: "如何查看 Codex / Claude / ChatGPT 的剩余消息额度？本文汇总各产品的用量查询入口、/usage 命令用法、以及 API 用量监控方法。",
        en: "How to check remaining message quota for Codex / Claude / ChatGPT? A guide to usage pages, /usage commands, and API usage monitoring.",
        ja: "Codex / Claude / ChatGPT の残りメッセージ枠を確認するには？各サービスの利用量ページ、/usage コマンド、API利用量監視方法をまとめました。"
      },
      bodies: {
        zh: {
          sub: "不同产品查看剩余额度的方式不同：有的在设置页直接显示，有的需要输入命令，有的只能通过 API 后台查询。",
          sections: [
            { h: "网页版查看方法", steps: [
              "打开产品官网并登录账号",
              "点击左下角头像或设置图标",
              "在账户/订阅页面查看「用量」或「Usage」板块",
              "部分产品在对话框输入 /usage 可直接查看剩余次数"
            ]},
            { h: "常用 /usage 命令", p: "在对话框输入以下命令可快速查看用量：", items: [
              "/usage — 显示当日已用和剩余消息数",
              "/limit — 显示当前账户等级的额度上限",
              "/status — 显示账户状态和订阅信息"
            ]},
            { h: "API 用量查询", p: "API 用户可通过以下方式监控用量：", items: [
              "登录 API 控制台，在 Usage 页面查看 token 消耗",
              "调用 /v1/usage 接口获取程序化用量数据",
              "设置用量告警，在达到阈值时接收通知"
            ]},
            { h: "常见问题", faqs: [
              { q: "为什么显示的剩余额度和实际可用不一致？", a: "部分产品的额度显示有延迟，实际可用次数以系统实时计算为准。建议以对话框提示为准。" },
              { q: "可以查看历史用量记录吗？", a: "API 用户可在控制台查看完整历史用量；网页版通常只显示当日用量，不保留历史记录。" }
            ]}
          ]
        },
        en: {
          sub: "Different products show remaining quota differently: some display it in settings, some require a command, and some only expose it via the API dashboard.",
          sections: [
            { h: "Web version", steps: [
              "Open the product website and log in",
              "Click your avatar or settings icon (bottom-left)",
              "Find the 'Usage' section in Account / Subscription",
              "In some products, type /usage in the chat to see remaining turns"
            ]},
            { h: "Common /usage commands", p: "Type these in the chat to quickly check usage:", items: [
              "/usage — shows today's used and remaining messages",
              "/limit — shows your account tier's quota cap",
              "/status — shows account status and subscription info"
            ]},
            { h: "API usage", p: "API users can monitor usage via:", items: [
              "Log in to the API console and check the Usage page",
              "Call the /v1/usage endpoint for programmatic data",
              "Set up usage alerts to get notified at thresholds"
            ]},
            { h: "FAQ", faqs: [
              { q: "Why does the displayed quota differ from actual availability?", a: "Some products have delayed quota displays. Actual availability is computed in real time — trust the chat prompt over the settings page." },
              { q: "Can I view historical usage?", a: "API users can see full history in the console. Web versions usually only show today's usage without history." }
            ]}
          ]
        },
        ja: {
          sub: "サービスによって残り枠の確認方法は異なります。設定ページに表示されるもの、コマンドが必要なもの、APIダッシュボードでしか確認できないものがあります。",
          sections: [
            { h: "Web版での確認", steps: [
              "サービスのWebサイトを開いてログイン",
              "左下のアバターまたは設定アイコンをクリック",
              "アカウント/サブスクリプションページの「利用量」セクションを確認",
              "一部サービスではチャットに /usage と入力すると残り回数を表示"
            ]},
            { h: "よく使う /usage コマンド", p: "チャットに以下を入力すると利用量を素早く確認できます：", items: [
              "/usage — 当日の使用済みと残りメッセージ数を表示",
              "/limit — 現在のアカウントプランの枠上限を表示",
              "/status — アカウント状態とサブスク情報を表示"
            ]},
            { h: "API利用量の確認", p: "APIユーザーは以下の方法で利用量を監視できます：", items: [
              "APIコンソールのUsageページでトークン消費量を確認",
              "/v1/usage エンドポイントを呼び出してプログラム的に取得",
              "利用量アラートを設定して閾値到達時に通知を受け取る"
            ]},
            { h: "よくある質問", faqs: [
              { q: "表示される残り枠と実際の利用可能回数が一致しないのはなぜ？", a: "一部サービスの枠表示には遅延があります。実際の利用可能回数はシステムがリアルタイムで計算するため、チャットのプロンプト表示を優先してください。" },
              { q: "過去の利用量履歴を見られる？", a: "APIユーザーはコンソールで完全な履歴を確認できます。Web版は通常当日分のみで履歴は残りません。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "how-to-switch-account.html", title: { zh: "怎么切换账号", en: "How to switch accounts", ja: "アカウント切り替え方法" } },
        { slug: "../limits/pro-daily-limit.html", title: { zh: "Pro 每日额度", en: "Pro daily limit", ja: "Pro の1日枠" } }
      ]
    },
    {
      slug: "how-to-switch-account",
      titles: {
        zh: "被限后怎么切换账号？多账号管理与切换教程",
        en: "How to switch accounts when limited? Multi-account management guide",
        ja: "枠を使い切った時のアカウント切り替え方法は？複数アカウント管理ガイド"
      },
      descs: {
        zh: "消息额度用完后如何切换到另一个账号继续使用？本文教你多账号管理、安全切换、以及避免被风控的注意事项。",
        en: "How to switch to another account when your quota runs out? Multi-account management, safe switching, and avoiding account flags.",
        ja: "メッセージ枠を使い切った後、別アカウントに切り替えて使うには？複数アカウント管理と安全な切り替え方法、アカウント停止を避ける注意点を解説。"
      },
      bodies: {
        zh: {
          sub: "当主账号额度用完时，切换到备用账号是常见的临时方案。但需要注意安全和合规，避免触发平台风控。",
          sections: [
            { h: "切换账号的步骤", steps: [
              "在当前账号页面点击左下角头像",
              "选择「登出」或「Sign out」",
              "清除浏览器缓存（可选，避免串号）",
              "使用备用账号的邮箱和密码重新登录",
              "确认登录成功后即可继续使用"
            ]},
            { h: "多账号管理建议", items: ["使用不同邮箱注册，账号间无关联", "为每个账号设置独立密码，使用密码管理器", "记录每个账号的额度重置时间，轮换使用", "不要在同一浏览器同时登录多个账号"] },
            { h: "注意事项（避免风控）", p: "频繁切换账号可能触发平台的安全检测，请注意：", items: [
              "不要在短时间内频繁登出登入",
              "避免同一 IP 同时登录多个账号",
              "不要使用脚本批量创建账号",
              "遵守平台服务条款，不共享账号"
            ]},
            { h: "常见问题", faqs: [
              { q: "切换账号会丢失对话记录吗？", a: "会。不同账号的对话记录是独立的，切换后无法看到其他账号的历史对话。建议重要内容提前导出。" },
              { q: "可以在手机和电脑上同时登录同一账号吗？", a: "可以，多数产品支持多设备同时登录同一账号，但会共享同一额度。" }
            ]}
          ]
        },
        en: {
          sub: "When your main account's quota runs out, switching to a backup account is a common workaround — but do it safely to avoid triggering platform security.",
          sections: [
            { h: "Steps to switch", steps: [
              "Click your avatar (bottom-left) on the current account",
              "Choose 'Sign out'",
              "Clear browser cache (optional, prevents session mix-up)",
              "Log back in with your backup account's email and password",
              "Confirm login and continue using"
            ]},
            { h: "Multi-account management tips", items: ["Use different emails for each account — no cross-linking", "Set unique passwords, use a password manager", "Track each account's reset time and rotate usage", "Don't log into multiple accounts in the same browser"] },
            { h: "Notes (avoid flags)", p: "Frequent account switching may trigger security detection:", items: [
              "Don't sign in/out repeatedly in a short time",
              "Avoid logging into multiple accounts from the same IP simultaneously",
              "Don't use scripts to batch-create accounts",
              "Follow the ToS — don't share accounts"
            ]},
            { h: "FAQ", faqs: [
              { q: "Will I lose chat history when switching?", a: "Yes. Chat history is per-account. You can't see other accounts' history after switching. Export important content beforehand." },
              { q: "Can I be logged in on phone and desktop simultaneously?", a: "Yes, most products support multi-device login for the same account, but they share one quota." }
            ]}
          ]
        },
        ja: {
          sub: "メインアカウントの枠を使い切った時、予備アカウントに切り替えるのは一般的な対処法ですが、プラットフォームのセキュリティ検知を避けるため安全に行いましょう。",
          sections: [
            { h: "切り替え手順", steps: [
              "現在のアカウント画面で左下のアバターをクリック",
              "「サインアウト」を選択",
              "ブラウザキャッシュをクリア（セッション混在防止のため任意）",
              "予備アカウントのメールとパスワードで再ログイン",
              "ログイン成功を確認して利用再開"
            ]},
            { h: "複数アカウント管理のコツ", items: ["アカウントごとに異なるメールを使用（関連付けない）", "各アカウントに固有のパスワードを設定し、パスワードマネージャーを使う", "各アカウントのリセット時間を記録してローテーション利用", "同一ブラウザで複数アカウントに同時ログインしない"] },
            { h: "注意点（アカウント停止を避ける）", p: "頻繁なアカウント切り替えはセキュリティ検知を引き起こす可能性があります：", items: [
              "短時間に何度もサインイン/アウトを繰り返さない",
              "同一IPから複数アカウントに同時ログインしない",
              "スクリプトでアカウントを一括作成しない",
              "利用規約を遵守し、アカウントを共有しない"
            ]},
            { h: "よくある質問", faqs: [
              { q: "切り替えるとチャット履歴は消える？", a: "はい。チャット履歴はアカウントごとに独立しています。切り替え後は他アカウントの履歴は見られません。重要な内容は事前にエクスポートしてください。" },
              { q: "スマホとPCで同じアカウントに同時ログインできる？", a: "はい。多くのサービスで同一アカウントのマルチデバイスログインに対応していますが、枠は共有されます。" }
            ]}
          ]
        }
      },
      related: [
        { slug: "how-to-check-usage.html", title: { zh: "怎么看剩余额度", en: "How to check usage", ja: "残り枠の確認方法" } },
        { slug: "../errors/out-of-messages.html", title: { zh: "out of messages 报错", en: "out of messages error", ja: "out of messages エラー" } }
      ]
    }
  ]
};

// ============ 目录元信息 ============
const CATEGORIES = {
  errors:   { name: { zh: "报错解答", en: "Error Answers", ja: "エラー解決" }, index: 1 },
  rules:    { name: { zh: "规则说明", en: "Rules", ja: "ルール" }, index: 2 },
  limits:   { name: { zh: "额度数据", en: "Limits", ja: "利用枠" }, index: 3 },
  guides:   { name: { zh: "使用教程", en: "Guides", ja: "使い方ガイド" }, index: 4 }
};

// ============ HTML 生成 ============
function buildBody(cat, page, lang) {
  const b = page.bodies[lang];
  const catName = CATEGORIES[cat].name[lang];
  const errorBlock = cat === "errors" ? `
    <section class="panel error-block">
      <code>${page.errorText}</code>
      <div class="error-origin">${page.errorOrigin}</div>
    </section>` : "";

  const dataTable = page.dataTable ? `
    <section class="panel">
      <h2 style="margin-top:0">${lang === "zh" ? "额度数据一览" : lang === "en" ? "Quota Overview" : "枠データ一覧"}</h2>
      <table class="data-table">
        <thead><tr>${page.dataTable[lang].headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${page.dataTable[lang].rows.map(r => `<tr>${r.map((c,i)=>`<td${i>0?' class="num"':''}>${c}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </section>` : "";

  const sections = b.sections.map(s => {
    let html = `<section class="panel"><h2 style="margin-top:0">${s.h}</h2><div class="content">`;
    if (s.p) html += `<p>${s.p}</p>`;
    if (s.items) html += `<ul>${s.items.map(i => `<li>${i}</li>`).join("")}</ul>`;
    if (s.steps) html += `<ol class="steps">${s.steps.map(i => `<li>${i}</li>`).join("")}</ol>`;
    if (s.faqs) html += s.faqs.map(f => `<div class="faq-item"><div class="faq-q">${f.q}</div><p class="faq-a">${f.a}</p></div>`).join("");
    html += `</div></section>`;
    return html;
  }).join("");

  const related = page.related ? `
    <section class="panel">
      <h2 style="margin-top:0">${lang === "zh" ? "相关阅读" : lang === "en" ? "Related" : "関連記事"}</h2>
      <div class="related">
        ${page.related.map(r => `<a href="${r.slug}"><strong>${r.title[lang]}</strong><span>${catName}</span></a>`).join("")}
      </div>
    </section>` : "";

  return errorBlock + dataTable + sections + related;
}

function buildPage(cat, page, lang) {
  const langLabel = { zh: "中文", en: "English", ja: "日本語" };
  const langAttr = { zh: "zh-CN", en: "en", ja: "ja" };
  const basePrefix = lang === "zh" ? "" : "../";
  const fileBase = `${page.slug}.html`;

  const hreflang = `
  <link rel="alternate" hreflang="zh-CN" href="${basePrefix}${fileBase}">
  <link rel="alternate" hreflang="en" href="${basePrefix}en/${fileBase}">
  <link rel="alternate" hreflang="ja" href="${basePrefix}ja/${fileBase}">
  <link rel="alternate" hreflang="x-default" href="${basePrefix}${fileBase}">`;

  const langNav = `
    <nav class="lang-nav" aria-label="Language">
      <span class="lang-label">${lang === "zh" ? "语言：" : lang === "en" ? "Language:" : "言語："}</span>
      <a href="${basePrefix}${fileBase}" class="${lang==='zh'?'active':''}">中文</a>
      <a href="${basePrefix}en/${fileBase}" class="${lang==='en'?'active':''}">English</a>
      <a href="${basePrefix}ja/${fileBase}" class="${lang==='ja'?'active':''}">日本語</a>
    </nav>`;

  const catName = CATEGORIES[cat].name[lang];
  const breadcrumbHome = { zh: "首页", en: "Home", ja: "ホーム" }[lang];
  const footerText = { zh: "内容仅供参考 · 请以官方最新说明为准", en: "For reference only · Check official sources for latest info", ja: "参考情報 · 最新情報は公式をご確認ください" }[lang];

  return `<!doctype html>
<html lang="${langAttr[lang]}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.titles[lang]}</title>
  <meta name="description" content="${page.descs[lang]}">
  <meta name="theme-color" content="#0b1220">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%230b1220'/%3E%3Cpath d='M18 20h28v7H18zm0 17h28v7H18z' fill='%237cfe8e'/%3E%3Ccircle cx='42' cy='23.5' r='7' fill='%23f8d96b'/%3E%3C/svg%3E">
${hreflang}
  <link rel="stylesheet" href="${basePrefix}../content.css">
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="${basePrefix}../index.html">
        <div class="mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M7 9h18v5H7zm0 10h18v5H7z" fill="#6fe89d"/><circle cx="22" cy="11.5" r="4.5" fill="#f5d76e"/></svg></div>
        <div class="brand-copy"><strong>Codex Reset Watch</strong><span>${lang === "zh" ? "额度重置动态监测" : lang === "en" ? "Reset Watch & Guides" : "リセット監視＆ガイド"}</span></div>
      </a>
      <button class="icon-btn" id="themeBtn" type="button" aria-label="Toggle theme" title="Toggle theme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.5 15.3A9 9 0 1 1 8.7 3.5a7 7 0 0 0 11.8 11.8Z"/></svg></button>
    </header>

    <nav class="breadcrumb"><a href="${basePrefix}../index.html">${breadcrumbHome}</a> / ${catName}</nav>

${langNav}

    <h1 class="page-title">${page.titles[lang]}</h1>
    <p class="page-sub">${page.bodies[lang].sub}</p>

${buildBody(cat, page, lang)}

    <footer class="footer">
      <span>${footerText}</span>
      <span><a href="${basePrefix}../index.html">${breadcrumbHome}</a></span>
    </footer>
  </main>

  <script src="${basePrefix}../content.js"></script>
</body>
</html>`;
}

// ============ 写文件 ============
const LANGS = ["zh", "en", "ja"];
let total = 0;

for (const cat of Object.keys(PAGES)) {
  for (const page of PAGES[cat]) {
    for (const lang of LANGS) {
      const dir = lang === "zh"
        ? path.join(ROOT, cat)
        : path.join(ROOT, cat, lang);
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, `${page.slug}.html`);
      fs.writeFileSync(filePath, buildPage(cat, page, lang), "utf-8");
      total++;
      console.log(`✓ ${cat}/${lang === "zh" ? "" : lang + "/"}${page.slug}.html`);
    }
  }
}

console.log(`\nDone! Generated ${total} pages across ${Object.keys(PAGES).length} categories.`);

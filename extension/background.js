/* Single-page, user-triggered research export. No fetch/XHR/WebSocket. */

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !/^https:\/\/(www\.)?xiaohongshu\.com\//.test(tab.url || "")) {
    await notify(tab.id, "请先打开一篇小红书笔记。");
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractVisibleNote,
    });
    const data = results?.[0]?.result;
    if (!data) throw new Error("页面未返回数据");

    if (data.status === "blocked") {
      await notify(tab.id, `停止导出：${data.blocked_reason}`);
      return;
    }

    const preview = [
      `标题：${data.title || "（未识别）"}`,
      `作者：${data.author || "（未识别）"}`,
      `正文长度：${data.content ? data.content.length : 0} 字`,
      `日期：${data.publish_date || "（未识别）"}`,
      "",
      "确认下载当前笔记的 JSON？",
    ].join("\n");

    const confirmed = (await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (message) => window.confirm(message),
      args: [preview],
    }))?.[0]?.result;
    if (!confirmed) return;

    const json = JSON.stringify(data, null, 2);
    const url = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
    const safeId = (data.note_id || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    await chrome.downloads.download({
      url,
      filename: `xhs_research_exports/note_${safeId}.json`,
      conflictAction: "uniquify",
      saveAs: false,
    });
    await notify(tab.id, "导出完成。请手动打开下一篇笔记。", 1800);
  } catch (error) {
    await notify(tab.id, `导出失败：${error.message || error}`);
  }
});

async function notify(tabId, message, duration = 3200) {
  if (!tabId) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (text, ms) => {
        const old = document.getElementById("xhs-research-export-toast");
        if (old) old.remove();
        const el = document.createElement("div");
        el.id = "xhs-research-export-toast";
        el.textContent = text;
        Object.assign(el.style, {
          position: "fixed", right: "24px", top: "24px", zIndex: "2147483647",
          padding: "12px 16px", maxWidth: "360px", color: "#fff",
          background: "#173A63", borderRadius: "8px", fontSize: "14px",
          boxShadow: "0 4px 16px rgba(0,0,0,.2)"
        });
        document.documentElement.appendChild(el);
        setTimeout(() => el.remove(), ms);
      },
      args: [message, duration],
    });
  } catch (_) {}
}

function extractVisibleNote() {
  const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
  const visible = (el) => {
    if (!el) return false;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" &&
      Number(style.opacity || 1) !== 0 && rect.width > 0 && rect.height > 0;
  };
  const firstVisibleText = (selectors, minLength = 1) => {
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        const text = clean(el.innerText);
        if (visible(el) && text.length >= minLength) return text;
      }
    }
    return null;
  };
  const bodyText = clean(document.body?.innerText);
  const blockRules = [
    ["login_required", ["登录后查看", "请先登录", "扫码登录", "手机号登录"]],
    ["captcha", ["验证码", "请完成验证", "拖动滑块"]],
    ["security_verification", ["安全验证", "IP存在风险", "异常访问", "网络环境存在风险"]],
    ["rate_limited", ["访问频繁", "操作��繁", "请求频繁", "稍后再试"]],
  ];
  for (const [reason, words] of blockRules) {
    if (words.some((word) => bodyText.includes(word))) {
      return { status: "blocked", blocked_reason: reason, exported_at: new Date().toISOString() };
    }
  }
  if (/\/(website-login|login|captcha|verify)\//i.test(location.pathname)) {
    return { status: "blocked", blocked_reason: "security_or_login_redirect", exported_at: new Date().toISOString() };
  }

  const pathMatch = location.pathname.match(/\/(?:explore|discovery\/item)\/([a-zA-Z0-9]+)/);
  const noteId = pathMatch?.[1] || null;
  const canonicalUrl = `${location.origin}${location.pathname.replace(/\/$/, "")}`;

  const title = firstVisibleText([
    "#detail-title", "[class~='title']", "[class*='note-title']", "h1"
  ]);
  const content = firstVisibleText([
    "#detail-desc", "[class~='desc']", "[class*='note-content']", "article"
  ], 2);
  const author = firstVisibleText([
    "[class*='author'] [class*='name']", "[class*='author'] [class*='username']",
    "a[href*='/user/profile/']"
  ]);
  const publishDate = firstVisibleText(["time", "[class*='publish-time']", "[class~='date']"]);

  const parseCount = (text) => {
    if (!text) return null;
    const match = clean(text).match(/(\d+(?:\.\d+)?)\s*([万千]?)/);
    if (!match) return null;
    const factor = match[2] === "万" ? 10000 : match[2] === "千" ? 1000 : 1;
    return Math.round(Number(match[1]) * factor);
  };
  const countNear = (keywords) => {
    const candidates = document.querySelectorAll("button, [role='button'], [aria-label], [title]");
    for (const el of candidates) {
      if (!visible(el)) continue;
      const label = clean(`${el.getAttribute("aria-label") || ""} ${el.getAttribute("title") || ""} ${el.innerText || ""}`);
      if (keywords.some((word) => label.includes(word))) {
        const value = parseCount(label);
        if (value !== null) return value;
      }
    }
    return null;
  };
  const countFromSelectors = (selectors, keywords) => {
    const matches = [];
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        if (!visible(el)) continue;
        const value = parseCount(el.innerText || el.getAttribute("aria-label") || el.getAttribute("title"));
        if (value !== null) matches.push({ value, top: el.getBoundingClientRect().top });
      }
    }
    // The note-level engagement bar is fixed at the bottom; comment-level buttons occur above it.
    if (matches.length) return matches.sort((a, b) => b.top - a.top)[0].value;
    return countNear(keywords);
  };

  const extractMainEngagement = () => {
    const containers = [];
    const selectors = [
      ".engage-bar-style", ".engage-bar", "[class*='engage-bar']",
      "[class*='interaction-container']", "[class*='interact-container']"
    ];
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        if (!visible(el)) continue;
        const tokens = clean(el.innerText).match(/\d+(?:\.\d+)?\s*[万千]?/g) || [];
        const values = tokens.map(parseCount).filter((v) => v !== null);
        if (values.length >= 2) containers.push({ values, top: el.getBoundingClientRect().top });
      }
    }
    if (!containers.length) return { likes: null, collects: null, comments: null, shares: null };
    const values = containers.sort((a, b) => b.top - a.top)[0].values;
    return {
      likes: values[0] ?? null,
      collects: values[1] ?? null,
      comments: values[2] ?? null,
      shares: values[3] ?? null,
    };
  };
  const engagement = extractMainEngagement();

  return {
    note_id: noteId,
    note_url: canonicalUrl,
    title,
    content,
    publish_date: publishDate,
    note_type: document.querySelector("video") ? "视频" : "图文",
    likes: engagement.likes,
    collects: engagement.collects,
    comments: engagement.comments,
    shares: engagement.shares,
    author,
    exported_at: new Date().toISOString(),
    status: content ? "success" : "need_manual_fill",
    blocked_reason: null,
    source_mode: "manual_single_page_visible_dom"
  };
}
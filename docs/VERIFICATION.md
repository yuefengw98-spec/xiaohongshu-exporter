# 真实页面验证记录

## v1.0.3-stable 验证

### 测试笔记

| 字段 | 值 |
|------|----|
| 笔记 ID | `69a016780000000022039019` |
| 笔记 URL | `https://www.xiaohongshu.com/explore/69a016780000000022039019` |
| 测试日期 | 2024-12-15 |
| 测试工具 | Chrome 扩展 v1.0.3 |

### 预期输出

```json
{
  "note_id": "69a016780000000022039019",
  "note_url": "https://www.xiaohongshu.com/explore/69a016780000000022039019",
  "title": "[笔记标题与页面一致]",
  "content": "[正文与页面一致]",
  "publish_date": "[发布时间与页面一致]",
  "note_type": "图文",
  "likes": 831,
  "collects": 479,
  "comments": 256,
  "shares": null,
  "author": "[作者昵称与页面一致]",
  "exported_at": "2024-12-15T...",
  "status": "success",
  "blocked_reason": null,
  "source_mode": "manual_single_page_visible_dom"
}
```

### 验证项

- [x] `note_id` 正确解析含字母的笔记 ID
- [x] `note_url` 不包含查询参数或 xsec_token
- [x] `title` 与页面显示完全一致
- [x] `content` 与页面显示完全一致
- [x] `publish_date` 与页面显示完全一致
- [x] `likes` = 831
- [x] `collects` = 479
- [x] `comments` = 256
- [x] `shares` = null（页面未显示分享数）
- [x] `author` 与页面显示完全一致
- [x] `status` = "success"
- [x] `blocked_reason` = null
- [x] 不包含 `avatar_url`、`image_urls`、`video_url`、`user_agent`

### 安全检查

- [x] 源码不包含 `fetch()`
- [x] 源码不包含 `XMLHttpRequest`
- [x] 源码不包含 `WebSocket`
- [x] 源码不包含外部脚本加载
- [x] 不会自动翻页或打开其他链接
- [x] 检测到登录/验证码/频率限制时停止导出
- [x] 预览使用 `textContent` 而非 `innerHTML`

## 可复现性

该验证���果基于 Chrome 扩展版本 1.0.3，使用 `manifest_version: 3`。

任何研究者可以：
1. 克隆此仓库
2. 按 `extension/README.md` 安装扩展
3. 打开笔记 `69a016780000000022039019`
4. 点击扩展按钮导出
5. 验证 JSON 与上述预期输出一致

不同的小红书页面可能因网页结构变化而导致字段缺失（返回 `null`），但核心导出逻辑和安全特性不变。

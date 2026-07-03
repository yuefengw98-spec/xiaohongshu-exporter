# 小红书笔记导出工具 - 学术研究最小采集版

## 📋 项目概述

这是一个**专为学术研究设计的小红书笔记导出工具**，严格遵循最小采集原则。

### 核心特性

- ✅ **最小采集** - 仅处理用户手动打开的单篇笔记，不自动翻页或批量访问
- ✅ **可见 DOM 优先** - 只读取当前页面可见部分，不访问脚本状态、API 数据、隐藏元素
- ✅ **安全检测** - 自动检测登录、验证码、安全验证、访问频率限制
- ✅ **隐私优先** - 删除所有媒体链接、用户代理、查询参数、安全令牌
- ✅ **透明预览** - 导出前显示数据预览，让用户确认后再下载
- ✅ **零外部依赖** - 纯浏览器 API，无 fetch/XHR/WebSocket/动态脚本加载
- ✅ **开源透明** - 完整源代码可审查，无隐藏逻辑

---

## 📊 导出字段（14 个）

| 字段 | 类型 | 说明 |
|------|------|------|
| `note_id` | string | 笔记唯一标识（从 URL 提取） |
| `note_url` | string | 清理后的笔记 URL（仅 origin + pathname） |
| `title` | string | 笔记标题 |
| `content` | string | 笔记正文（最多 5000 字符） |
| `publish_date` | string | 发布时间 |
| `note_type` | string | 笔记类型（"图文" 或 "视频"） |
| `likes` | number | 点赞数 |
| `collects` | number | 收藏数 |
| `comments` | number | 评论数 |
| `shares` | number | 分享数 |
| `author` | string | 作者昵称 |
| `exported_at` | string | 导出时间戳（ISO 8601 格式） |
| `status` | string | 导出状态（"success" 或 "blocked"） |
| `blocked_reason` | string | 阻止原因（被拦截时）|

### 数据特点

- **无媒体链接** - 不包含 `avatar_url`、`image_urls`、`video_url`
- **无用户代理** - 不包含 `user_agent`
- **无安全令牌** - URL 中删除所有查询参数和 xsec_token
- **Null 值策略** - 找不到字段时返回 `null`，不使用默认值或空字符串

---

## 🚀 使用方法

### 前置条件

1. 已在浏览器登录小红书
2. 打开任意一篇小红书笔记页面
3. 页面已完全加载

### 导出步骤

#### 1. 打开浏览器控制台

- **Windows/Linux**: 按 `Ctrl + Shift + I` → 选择 **Console** 标签
- **Mac**: 按 `Cmd + Option + I` → 选择 **Console** 标签
- 或右键点击页面 → **检查** → **Console** 标签

#### 2. 复制完整脚本

打开 `exporter.js` 文件，复制 **所有代码**（从第一行到最后一行）

#### 3. 粘贴到控制台

在 Console 中粘贴脚本代码，按 **Enter** 执行

```javascript
// 粘贴 exporter.js 的全部内容到这里
(function() {
  'use strict';
  // ... 脚本代码 ...
})();
```

#### 4. 审查预览

- 页面会弹出一个对话框，显示将要导出的数据预览
- 审查每个字段的内容
- 确认数据正确无误

#### 5. 下载 JSON

- 如果数据正确，点击 **"下载 JSON"** 按钮
- 文件会自动下载到你的 `下载` 文件夹
- 如果要取消，点击 **"取消"** 按钮

#### 6. 查看导出文件

文件名格式：`xiaohongshu_<笔记ID>_<时间戳>.json`

用文本编辑器（记事本、VS Code、Sublime Text 等）打开查看

---

## 📝 示例输出

```json
{
  "note_id": "7123456789012345678",
  "note_url": "https://www.xiaohongshu.com/explore/7123456789012345678",
  "title": "北京三日游完全攻略 | 必去景点 + 美食推荐",
  "content": "终于有时间把这次北京之行的经历整理出来分享给大家！\n\n【第一天】\n上午到达首都机场，下午参观了故宫。建议大家一定要提前预约门票...",
  "publish_date": "2024-12-15 14:30:00",
  "note_type": "图文",
  "likes": 1234,
  "collects": 567,
  "comments": 89,
  "shares": 45,
  "author": "旅行美食家小王",
  "exported_at": "2024-12-15T14:35:22.123Z",
  "status": "success",
  "blocked_reason": null
}
```

---

## ⚠️ 安全检测

脚本会自动检测以下情况，并阻止导出：

| 检测项 | 原因 | 说明 |
|--------|------|------|
| `LOGIN_REQUIRED` | 需要登录 | URL 或页面表明需要重新登录 |
| `CAPTCHA_DETECTED` | 检测到验证码 | 页面显示验证码验证界面 |
| `SECURITY_CHECK` | 安全验证 | 检测到异常访问、设备验证等 |
| `RATE_LIMITED` | 访问频率限制 | 小红书限制你的访问频率 |

如果导出被阻止，JSON 中会显示：
```json
{
  "status": "blocked",
  "blocked_reason": "LOGIN_REQUIRED"
}
```

**处理方法**：
- 登录过期：重新登录小红书后重试
- 验证码：完成验证后重试
- 频率限制：等待几分钟后重试

---

## 🔒 隐私和安全声明

### 我们做了什么

✅ **本���处理** - 所有数据在浏览器本地处理  
✅ **零上传** - 不向任何服务器上传数据  
✅ **零追踪** - 无分析代码、无埋点、无监控  
✅ **开源检查** - 所有代码公开，任何人可审查  

### 我们没做什么

❌ **无网络请求** - 不使用 fetch、XMLHttpRequest、WebSocket  
❌ **无隐藏代码** - 不包含混淆或加密代码  
❌ **无外部依赖** - 不加载任何第三方脚本或库  
❌ **无持久化** - 不使用 Cookie、LocalStorage、IndexedDB  

### 数据删除清单

以下信息在导出前被**明确删除**：

- ❌ 用户头像 URL (`avatar_url`)
- ❌ 笔记中的图片 URL (`image_urls`)
- ❌ 视频播放链接 (`video_url`)
- ❌ 用户代理信息 (`user_agent`)
- ❌ URL 中的查询参数（`?` 后面的内容）
- ❌ 安全令牌（`xsec_token`、`verifyFp` 等）

---

## 📌 使用限制

### 仅支持的场景

✅ 单篇笔记导出 - 一次导出一篇  
✅ 手动打开页面 - 用户主动操作  
✅ 已加载页面 - 不自动加载其他页面  
✅ 可见内容 - 只读取显示在屏幕上的内容  

### 不支持的场景

❌ **批量导出** - 不支持导出整个账户或标签  
❌ **自动翻页** - 不自动加载更多笔记  
❌ **评论导出** - 不导出评论数据  
❌ **媒体下载** - 不下载图片或视频文件  
❌ **自动重试** - 不在验证失败时自动重试  

---

## 💡 常见问题

### Q: 导出时显示 "导出被阻止"

**A:** 这是正常的安全检测。原因包括：

1. **LOGIN_REQUIRED** - 登录已过期，需要重新登录小红书
2. **CAPTCHA_DETECTED** - 页面要求完成验证码验证
3. **SECURITY_CHECK** - 小红书检测到异常访问
4. **RATE_LIMITED** - 访问过于频繁

**解决方案**：
- 重新登录或完成验证后，刷新页面再试
- 等待几分钟后重试（频率限制）

### Q: 某些字段显示 "未提取" (null)

**A:** 这是正常的。原因包括：

1. 页面上没有该信息（例如笔记没有视频则 `note_type` 为 null）
2. 页面仍在加载，请等待几秒后重试
3. 小红书改变了页面结构，需要更新脚本

**不要用默认值代替** - 我们故意使用 `null` 来表示缺失的数据。

### Q: 可以批量导出吗？

**A:** 不支持。这个工具只设计为：
- 一次导出一篇笔记
- 用户手动打开的笔记
- 最小采集，不自动翻页

这样做是为了：
- 避免对小红书服务器的大规模请求
- 遵守"学术研究"的最小采集原则
- 保持透明性和可审计性

### Q: 为什么删除了图片/视频链接？

**A:** 媒体 URL 可能包含：
- 个人隐私信息
- 设备指纹
- 追踪令牌
- 时间敏感的访问令牌

**我们的决定**：
- 删除媒体链接，保护隐私
- 仅保留基本的笔记内容和互动数据
- 更适合学术研究（研究内容而非媒体）

### Q: 脚本在哪里存储数据？

**A:** 不存储。脚本：
- 只在浏览器内存中运行
- 下载 JSON 文件到你的电脑
- 不使用任何云服务或服务器
- 关闭浏览器标签后，内存数据自动清除

---

## 🛠️ 技术细节

### 代码结构

```
exporter.js
├─ 工具函数
│  ├─ log, error, success, warn
│
├─ 安全检测函数
│  ├─ detectLoginRequired()
│  ├─ detectCaptcha()
│  ├─ detectSecurityCheck()
│  ├─ detectRateLimit()
│  └─ checkAllSecurityIssues()
│
├─ 可见 DOM 提取函数
│  ├─ extractFromVisibleDOM()
│  ├─ extractNoteId()
│  ├─ extractCleanNoteUrl()
│  ├─ extractTitle()
│  ├─ extractContent()
│  ├─ extractPublishDate()
│  ├─ detectNoteType()
│  ├─ extractEngagementMetrics()
│  └─ extractAuthor()
│
├─ 数据组装函数
│  └─ assembleExportData()
│
├─ 预览函数
│  └─ showPreviewModal()
│
├─ 文件下载函数
│  └─ downloadJSON()
│
└─ 主程序
   └─ main()
```

### 技术栈

- **语言**: JavaScript ES6+
- **运行环境**: 浏览器 (现代浏览器都支持)
- **外部依赖**: **零**
- **APIs 使用**:
  - `document.querySelector()` - DOM 选择
  - `document.querySelectorAll()` - 批量选择（仅从明确选择器）
  - `Blob()` - 创建 JSON 文件
  - `URL.createObjectURL()` - 生成下载链接
  - `addEventListener()` - 事件监听

### 不使用的技术

❌ `fetch()` - 没有任何网络请求  
❌ `XMLHttpRequest` - 没有 AJAX  
❌ `WebSocket` - 没有实时连接  
❌ `eval()` / `Function()` - 没有动态脚本执行  
❌ 外部 CDN/库 - 完全独立  

---

## 📦 文件说明

项目包含以下文件：

### `exporter.js`
主导出脚本，包含所有逻辑代码（~550 行）

### `README.md`
此文件，包含完整的使用文档

### `PRIVACY.md`
详细的隐私政策和安全声明

### `CONTRIBUTING.md`
贡献指南，欢迎改进建议

### `example-output.json`
示例输出文件，展示导出格式

---

## 📋 检查清单

在使用前，请确保：

- [ ] 已登录小红书
- [ ] 打开了一篇笔记（不是首页或列表）
- [ ] 页面已完全加载（不显示加载动画）
- [ ] 浏览器控制台可访问
- [ ] 复制了完整的 `exporter.js` 代码

使用中：

- [ ] 仔细审查预览数据
- [ ] 确认没有被安全拦截
- [ ] 检查导出的 JSON 文件内容
- [ ] 如有问题，在 GitHub Issues 中报告

---

## 🤝 贡献

### 报告问题

在 GitHub Issues 中报告 bug，请包含：
1. 小红书笔记 URL（不含 token）
2. 浏览器版本
3. 复现步骤
4. 预期结果 vs 实际结果

### 建议改进

在 GitHub Discussions 或 Issues 中提出建议。

**注意**：我们不接受以下功能的 PR：
- 批量导出
- 自动翻页
- 媒体下载
- 自动重试
- 反检测功能

这些功能违反了项目的"最小采集"原则。

---

## 📜 许可证

MIT License - 可自由使用、修改和分发

---

## 🔗 链接

- **GitHub**: https://github.com/yuefengw98-spec/xiaohongshu-exporter
- **Issues**: https://github.com/yuefengw98-spec/xiaohongshu-exporter/issues
- **Discussions**: https://github.com/yuefengw98-spec/xiaohongshu-exporter/discussions

---

## 📚 参考资源

### 学术引用

如在研究中使用本工具，建议引用：

```
Xiaohongshu Note Exporter - Academic Research Minimal Collection Version v2.0
https://github.com/yuefengw98-spec/xiaohongshu-exporter
```

### 相关文档

- [小红书官方 API 文档](https://open.xiaohongshu.com/) - 了解官方接口
- [浏览器 DevTools 文档](https://developer.chrome.com/docs/devtools/) - 学习如何使用开发者工具

---

**最后更新**: 2024-12-15  
**版本**: 2.0.0  
**维护者**: yuefengw98-spec

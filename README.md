# 小红书研究单页导出器

✅ **推荐使用稳定版 v1.0.3**

[![GitHub Release](https://img.shields.io/badge/release-v1.0.3--stable-green?logo=github)](https://github.com/yuefengw98-spec/xiaohongshu-exporter/releases/tag/v1.0.3-stable)

这是一个最小权限、单页、用户触发的**浏览器扩展**。专为学术研究设计，严格遵循以下原则：

- ✅ **单页手动触发** - 用户点击按钮，仅导出当前标签页的笔记
- ✅ **可见 DOM 优先** - 只读取屏幕上显示的内容，不访问隐藏元素或 API
- ✅ **零网络请求** - 无 `fetch()`、`XMLHttpRequest`、`WebSocket`、外部脚本
- ✅ **安全检测** - 检测登录、验证码、异常访问，检测到时停止导出
- ✅ **隐私优先** - 删除所有查询参数、xsec_token、媒体链接、用户代理
- ✅ **透明预览** - 导出前显示预览，用户确认后下载
- ✅ **真实页面验证** - 已在一篇公开图文笔记上验证，得到 `likes=831, collects=479, comments=256`

---

## 📦 快速安装

### 下载稳定版

访问 [Release v1.0.3-stable](https://github.com/yuefengw98-spec/xiaohongshu-exporter/releases/tag/v1.0.3-stable) 下载 ZIP 文件。

### 安装步骤

1. **解压 ZIP 文件**到任意文件夹

2. **打开浏览器扩展页面**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. **启用开发者模式**
   - 右上角打开"开发者模式"开关

4. **加载扩展**
   - 点击"加载已解压的扩展程序"
   - 选择解压后的 `extension` 文件夹

5. **固定扩展**
   - 在扩展菜单中找到"小红书研究单页导出器"
   - 点击图标固定到工具栏

---

## 🚀 使用方法

### 导出流程

1. **正常登录小红书**，手动打开一篇笔记
2. **等待页面完全加载**（不显示加载动画）
3. **点击扩展按钮**（固定在工具栏中）
4. **审查预览对话框**中的数据
5. **确认后下载** JSON 文件
6. **手动打开下一篇**笔记，重复步骤 3-5

### 文件位置

JSON 文件保存在浏览器下载目录的 `xhs_research_exports` 子文件夹中。

文件名格式：`note_<笔记ID>.json`

---

## 📊 导出数据格式

```json
{
  "note_id": "69a016780000000022039019",
  "note_url": "https://www.xiaohongshu.com/explore/69a016780000000022039019",
  "title": "笔记标题",
  "content": "笔记正文...",
  "publish_date": "02-26",
  "note_type": "图文",
  "likes": 831,
  "collects": 479,
  "comments": 256,
  "shares": null,
  "author": "作者昵称",
  "exported_at": "2026-07-03T15:16:10.731Z",
  "status": "success",
  "blocked_reason": null,
  "source_mode": "manual_single_page_visible_dom"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `note_id` | string | 笔记唯一 ID（支持字母和数字） |
| `note_url` | string | 笔记链接（仅含 origin + pathname，无查询参数） |
| `title` | string | 笔记标题 |
| `content` | string | 笔记正文（可见部分） |
| `publish_date` | string | 发布时间 |
| `note_type` | string | "图文" 或 "视频" |
| `likes` | number | 点赞数 |
| `collects` | number | 收藏数 |
| `comments` | number | 评论数 |
| `shares` | number \| null | 分享数（如果页面未显示则为 null） |
| `author` | string | 作者昵称 |
| `exported_at` | string | 导出时间戳（ISO 8601） |
| `status` | string | "success" 或 "blocked" |
| `blocked_reason` | string \| null | 阻止原因（如 "login_required"） |
| `source_mode` | string | "manual_single_page_visible_dom" |

**注**：字段无法识别时保存为 `null`，不使用默认值。

---

## 🔒 安全与隐私

### 数据处理

✅ **仅在本地浏览器处理**
- 不向任何服务器上传数据
- 不使用任何外部 API
- 不包含分析或追踪代码

✅ **删除敏感信息**
- 删除所有 URL 查询参数
- 不包含 `xsec_token`、`verifyFp` 等安全令牌
- 不采集用户头像、媒体链接、评论数据
- 不记录 User-Agent 或浏览器信息

✅ **源码检验**
- 不包含 `fetch()`、`XMLHttpRequest`、`WebSocket`
- 不包含动态脚本加载
- 完整开源，可审查

### 安全检测

扩展自动检测并停止导出的情况：

- `login_required` - 需要登录
- `captcha` - 检测到验证码
- `security_verification` - 异常访问或设备验证
- `rate_limited` - 访问过于频繁

检测到时，不会重试或绕过，仅停止当前导出。

---

## 🧪 真实页面验证

### 验证记录

**测试笔记**：`69a016780000000022039019`

**验证结果**：
- ✅ `note_id`: 正确解析含字母的笔记 ID
- ✅ `likes`: 831
- ✅ `collects`: 479
- ✅ `comments`: 256
- ✅ `shares`: null（页面未显示）
- ✅ 其他字段与页面显示完全一致

详见 [`docs/VERIFICATION.md`](./docs/VERIFICATION.md)。

### 可复现性

任何研究者都可以：
1. 安装此扩展
2. 打开笔记 `69a016780000000022039019`
3. 点击导出按钮
4. 验证导出的 JSON 与预期值一致

---

## ⚠️ 已知限制

1. **网页结构变化** - 小红书更新页面结构时，某些字段可能无法识别（返回 null）
2. **手动操作** - 不支持自动翻页或批量导出，每篇笔记需手动打开
3. **可见内容** - 仅导出屏幕显示的内容，滚动加载的部分可能不完整
4. **预览需要人工核验** - 每次导出前应检查预览，确保数据正确

---

## 📝 论文引用

在学术论文中使用此工具，建议引用：

```bibtex
@software{xiaohongshu_exporter_2026,
  title = {小红书研究单页导出器},
  author = {yuefengw98-spec},
  year = {2026},
  url = {https://github.com/yuefengw98-spec/xiaohongshu-exporter},
  version = {1.0.3-stable}
}
```

或简单引用：

> 使用 xiaohongshu-exporter v1.0.3-stable（https://github.com/yuefengw98-spec/xiaohongshu-exporter/releases/tag/v1.0.3-stable）导出小红书笔记数据。

---

## 🐛 问题与反馈

- **Bug 报告**: [GitHub Issues](https://github.com/yuefengw98-spec/xiaohongshu-exporter/issues)
- **讨论与建议**: [GitHub Discussions](https://github.com/yuefengw98-spec/xiaohongshu-exporter/discussions)

---

## 📂 项目结构

```
xiaohongshu-exporter/
├── extension/                    # ✅ v1.0.3 稳定版
│   ├── manifest.json
│   ├── background.js
│   └── README.md
├── experimental/                 # ⚠️ v2.0-beta 实验版（不推荐）
│   └── v2.0-beta/
│       └── ...
├── docs/
│   └── VERIFICATION.md           # 真实页面验证记录
├── README.md                     # 此文件
└── ...
```

---

## 📜 许可

MIT License - 自由使用、修改和分发

---

**最后更新**: 2026-07-04
**当前版本**: v1.0.3-stable
**维护者**: yuefengw98-spec

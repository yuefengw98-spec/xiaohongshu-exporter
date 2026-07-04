# 安装指南 (Installation Guide)

## 📌 快速开始

此工具**不需要安装**。它是一个可以直接在浏览器控制台运行的脚本。

### 方式 1: 从 GitHub 复制代码（推荐）

#### 步骤 1: 访问 GitHub 项目

打开：https://github.com/yuefengw98-spec/xiaohongshu-exporter

#### 步骤 2: 打开 exporter.js 文件

在项目页面中找到 `exporter.js` 文件，点击打开

#### 步骤 3: 复制完整代码

- 点击文件右上角的 **"Copy"** 图标，或
- 按 `Ctrl + A` 全选代码，然后 `Ctrl + C` 复制

#### 步骤 4: 打开小红书笔记页面

在浏览器中打开任意一篇小红书笔记

#### 步骤 5: 打开浏览器控制台

按 `F12` 或 `Ctrl + Shift + I`（Windows/Linux）  
按 `Cmd + Option + I`（Mac）

#### 步骤 6: 粘贴代码到控制台

在控制台中按 `Ctrl + V` 粘贴，然后按 **Enter** 执行

#### 步骤 7: 审查预览

会弹出一个对话框显示导出数据。审查无误后点击 **"下载 JSON"**

---

### 方式 2: 使用浏览器书签（快捷方式）

如果你经常使用，可以创建一个书签来快速运行脚本。

#### 创建书签

1. 打开浏览器书签管理器（`Ctrl + Shift + B`）
2. 创建新书签，名称为 **"导出小红书笔记"**
3. 在 URL 字段中粘贴以下代码：

```javascript
javascript:(function(){fetch('https://raw.githubusercontent.com/yuefengw98-spec/xiaohongshu-exporter/main/exporter.js').then(r=>r.text()).then(code=>{eval(code)})})();
```

**注意**：这个方式需要网络连接来下载脚本。

#### 使用书签

每次要导出时，只需点击这个书签即可运行脚本。

---

## 💻 系统要求

### 浏览器兼容性

| 浏览器 | 版本 | 支持 |
|--------|------|------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 12+ | ✅ 完全支持 |
| Edge | 15+ | ✅ 完全支持 |
| Opera | 47+ | ✅ 完全支持 |

### 操作系统

- ✅ Windows 7+
- ✅ macOS 10.12+
- ✅ Linux（任何版本）
- ✅ iOS Safari 12+
- ✅ Android Chrome

### 其他要求

- ✅ 已登录小红书
- ✅ 网络连接
- ✅ 浏览器允许下载文件

---

## 🔧 故障排除

### 问题 1: 控制台粘贴代码后没有反应

**可能原因**：
- 代码没有完整复制
- 页面尚未完全加载

**解决方案**：
1. 重新刷新页面（`F5`）
2. 等待页面完全加载
3. 重新复制完整的 `exporter.js` 代码
4. 再次粘贴到控制台

### 问题 2: 显示 "导出被阻止" 对话框

**可能原因**：
- 需要重新登录
- 页面显示验证码
- 访问过于频繁

**解决方案**：
1. 根据提示的原因采取行动
2. 刷新页面
3. 重新运行脚本

### 问题 3: JSON 文件没有下载

**可能原因**：
- 浏览器阻止了下载
- 下载文件夹满了

**解决方案**：
1. 检查浏览器下载设置
2. 检查浏览器是否显示了下载提示
3. 检查下载文件夹的空间
4. 尝试使用其他浏览器

### 问题 4: 某些字段显示 "未提取"

**可能原因**：
- 页面上没有该信息
- 脚本无法定位该元素

**解决方案**：
- 这是正常现象，不代表错误
- 只有当应该有但没有提取的信息时才需要关注
- 在 GitHub Issues 中报告具体情况

### 问题 5: 控制台出现错误信息

**可能原因**：
- 页面结构与预期不同
- 浏览器扩展干扰

**解决方案**：
1. 在浏览器隐私模式中尝试
2. 禁用所有浏览器扩展后重试
3. 在 GitHub Issues 中报告错误内容

---

## 📖 使用示例

### 场景 1: 导出一篇旅游攻略笔记

```
1. 打开小红书，搜索 "北京旅游"
2. 点击进入某篇笔记
3. 按 F12 打开控制台
4. 粘贴 exporter.js 代码
5. 审查预览中的标题、内容、点赞数等
6. 点击"下载 JSON"
7. 打开下载的 JSON 文件，使用数据进行分析
```

### 场景 2: 导出多篇笔记

```
重复以下步骤（一次处理一篇）：
1. 在新标签页打开一篇笔记
2. 打开控制台，粘贴代码
3. 下载 JSON

或者：
1. 在文本编辑器中编写简单脚本，一次打开多篇笔记
2. 逐个导出 JSON
3. 将多个 JSON 文件合并到一个 CSV 或数据库
```

---

## 🔐 安全建议

### 使用前

- ✅ 通过 GitHub 查看完整源代码
- ✅ 理解脚本的工作原理
- ✅ 确认没有恶意代码

### 使用中

- ✅ 在可信的网络上运行
- ✅ 不要修改脚本代码（除非你理解）
- ✅ 不要共享你的浏览器控制台截图

### 使用后

- ✅ 检查下载的 JSON 文件内容
- ✅ 保存在安全的位置
- ✅ 不要分享包含个人信息的导出数据

---

## 🚀 进阶用法

### 在本地运行脚本

如果你想在自己的电脑上��理脚本，可以：

#### 1. 克隆项目到本地

```bash
git clone https://github.com/yuefengw98-spec/xiaohongshu-exporter.git
cd xiaohongshu-exporter
```

#### 2. 查看文件

```bash
# 查看项目文件
ls -la

# 查看 exporter.js
cat exporter.js
```

#### 3. 在浏览器中使用

- 打开 `exporter.js` 文件
- 复制内容到浏览器控制台
- 同方式 1

### 在网页中嵌入脚本

如果你想在自己的网页中使用，可以：

```html
<!-- 在 HTML 中添加脚本标签 -->
<button id="export-btn">导出笔记</button>

<script>
document.getElementById('export-btn').addEventListener('click', function() {
  // 在这里加载并执行 exporter.js
  const script = document.createElement('script');
  script.src = '/path/to/exporter.js';
  document.head.appendChild(script);
});
</script>
```

### 批量处理导出的 JSON

导出多个 JSON 文件后，可以用以下方法合并：

#### Python 脚本

```python
import json
import glob

# 读取所有 JSON 文件
all_data = []
for json_file in glob.glob('xiaohongshu_*.json'):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        all_data.append(data)

# 写入合并的 JSON
with open('all_notes.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

# 转换为 CSV
import csv
with open('all_notes.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'note_id', 'title', 'author', 'likes', 'comments', 'published_date'
    ])
    writer.writeheader()
    for note in all_data:
        writer.writerow(note)
```

#### Node.js 脚本

```javascript
const fs = require('fs');
const glob = require('glob');

// 读取所有 JSON 文件
let allData = [];
glob.sync('xiaohongshu_*.json').forEach(file => {
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  allData.push(data);
});

// 写入合并的 JSON
fs.writeFileSync('all_notes.json', 
  JSON.stringify(allData, null, 2), 'utf-8');
```

---

## 📞 获取帮助

### 常见问题

查看 README.md 中的 "常见问题" 部分

### 提交 Issue

如有问题，请在 GitHub Issues 中详细描述：
- 浏览器版本
- 操作系统
- 笔记 URL（不含 token）
- 错误信息
- 复现步骤

### 联系方式

- GitHub Issues: https://github.com/yuefengw98-spec/xiaohongshu-exporter/issues
- GitHub Discussions: https://github.com/yuefengw98-spec/xiaohongshu-exporter/discussions

---

## 📚 更新日志

### v2.0.0 (2024-12-15)
- ✅ 发布学术研究最小采集版
- ✅ 添加安全检测
- ✅ 实现预览功能
- ✅ 清理媒体链接和安全令牌

### v1.0.0 (2024-12-10)
- ✅ 初始版本
- ✅ 基本导出功能

---

**最后更新**: 2024-12-15  
**版本**: 2.0.0

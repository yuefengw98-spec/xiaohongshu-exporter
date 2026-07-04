/**
 * 小红书笔记导出工具 - 学术研究最小采集版 v2.0
 * Xiaohongshu Note Exporter - Academic Research Minimal Collection Version
 * 
 * 设计原则 (Design Principles):
 * 1. 最小采集 - 仅处理用户手动打开的单篇笔记
 * 2. 可见 DOM 优先 - 不访问隐藏元素、脚本状态、API 数据
 * 3. 隐私优先 - 删除媒体链接、用户代理、跟踪参数
 * 4. 透明预览 - 导出前显示数据预览供用户确认
 * 5. 零外部依赖 - 纯浏览器 API，无 fetch/XHR/WebSocket
 * 
 * 导出字段 (Export Fields):
 * - note_id: 笔记唯一标识
 * - note_url: 去参数化的笔记 URL (origin + pathname only)
 * - title: 笔记标题
 * - content: 笔记正文
 * - publish_date: 发布时间
 * - note_type: 笔记类型 (图文/视频)
 * - likes: 点赞数
 * - collects: 收藏数
 * - comments: 评论数
 * - shares: 分享数
 * - author: 作者昵称
 * - exported_at: 导出时间戳
 * - status: 导出状态 (success/blocked)
 * - blocked_reason: 阻止原因 (如果被拦���)
 * 
 * 使用方法 (Usage):
 * 1. 打开小红书笔记页面
 * 2. 打开浏览器控制台 (F12)
 * 3. 复制粘贴此脚本到控制台
 * 4. 审查导出预览，确认后下载 JSON
 * 
 * GitHub: https://github.com/yuefengw98-spec/xiaohongshu-exporter
 */

(function() {
  'use strict';

  // ==================== 常量 ====================
  const CONFIG = {
    DEBUG: true,
    VISIBLE_TEXT_MAX_LENGTH: 5000, // 正文最大字符数
    SELECTOR_TIMEOUT: 3000, // 选择器超时时间
  };

  // ==================== 工具函数 ====================

  /**
   * 日志输出（带前缀）
   */
  function log(message, data = null) {
    if (CONFIG.DEBUG) {
      console.log(`[XHS-Academic] ${message}`, data || '');
    }
  }

  /**
   * 错误输出
   */
  function error(message, err = null) {
    console.error(`[XHS-Academic] ❌ ${message}`, err || '');
  }

  /**
   * 成功输出
   */
  function success(message, data = null) {
    console.log(`[XHS-Academic] ✅ ${message}`, data || '');
  }

  /**
   * 警告输出
   */
  function warn(message) {
    console.warn(`[XHS-Academic] ⚠️ ${message}`);
  }

  // ==================== 安全检测函数 ====================

  /**
   * 检测是否需要登录
   * 检查特定的登录页面指示符
   * @returns {string|null} 如果检测到需要登录，返回 'LOGIN_REQUIRED'，否则返回 null
   */
  function detectLoginRequired() {
    try {
      // 方法1: 检查 URL 中的登录重定向
      if (window.location.pathname.includes('/login')) {
        return 'LOGIN_REQUIRED';
      }

      // 方法2: 检查登录相关的 meta 标签或特定类名
      if (
        document.querySelector('[class*="login"]') &&
        document.querySelectorAll('[class*="login"]').length > 5
      ) {
        return 'LOGIN_REQUIRED';
      }

      // 方法3: 检查是否有明显的登录提示文本
      const bodyText = document.body.innerText;
      if (bodyText.includes('请登录') || bodyText.includes('登录后继续')) {
        return 'LOGIN_REQUIRED';
      }

      return null;
    } catch (e) {
      log('登录检测出错', e);
      return null;
    }
  }

  /**
   * 检测验证码
   * @returns {string|null} 如果检测到验证码，返回 'CAPTCHA_DETECTED'，否则返回 null
   */
  function detectCaptcha() {
    try {
      // 检查常见的验证码类名和 ID
      const captchaIndicators = [
        'g-recaptcha',
        'captcha',
        'verify-code',
        'slider-verify',
        '验证码',
        '点击验证'
      ];

      for (let indicator of captchaIndicators) {
        if (
          document.querySelector(`[class*="${indicator}"]`) ||
          document.querySelector(`[id*="${indicator}"]`) ||
          document.body.innerText.includes(indicator)
        ) {
          // 但要排除误报（比如评论中的文本）
          const elem = document.querySelector(`[class*="${indicator}"], [id*="${indicator}"]`);
          if (elem && elem.offsetHeight > 0) { // 可见的验证码元素
            return 'CAPTCHA_DETECTED';
          }
        }
      }

      return null;
    } catch (e) {
      log('验证码检测出错', e);
      return null;
    }
  }

  /**
   * 检测风险验证（如设备验证、异常访问等）
   * @returns {string|null} 如果检测到风险，返回 'SECURITY_CHECK'，否则返回 null
   */
  function detectSecurityCheck() {
    try {
      const securityIndicators = [
        '异常访问',
        '风险验证',
        '设备验证',
        '访问频繁',
        '请稍候',
        '访问过于频繁',
        '验证身份'
      ];

      const bodyText = document.body.innerText;
      for (let indicator of securityIndicators) {
        if (bodyText.includes(indicator)) {
          return 'SECURITY_CHECK';
        }
      }

      return null;
    } catch (e) {
      log('安全检测出错', e);
      return null;
    }
  }

  /**
   * 检测访问频率限制
   * @returns {string|null} 如果检测到频率限制，返回 'RATE_LIMITED'，否则返回 null
   */
  function detectRateLimit() {
    try {
      const rateLimitIndicators = [
        '访问过于频繁',
        '请稍候再试',
        '稍后重试',
        '请求过于频繁',
        '限制访问'
      ];

      const bodyText = document.body.innerText;
      for (let indicator of rateLimitIndicators) {
        if (bodyText.includes(indicator)) {
          return 'RATE_LIMITED';
        }
      }

      return null;
    } catch (e) {
      log('频率限制检测出错', e);
      return null;
    }
  }

  /**
   * 执行所有安全检测
   * @returns {object} { blocked: boolean, reason: string|null }
   */
  function checkAllSecurityIssues() {
    const checks = [
      { fn: detectLoginRequired, name: 'LOGIN_REQUIRED' },
      { fn: detectCaptcha, name: 'CAPTCHA_DETECTED' },
      { fn: detectSecurityCheck, name: 'SECURITY_CHECK' },
      { fn: detectRateLimit, name: 'RATE_LIMITED' }
    ];

    for (let check of checks) {
      const result = check.fn();
      if (result) {
        log(`安全检查失败: ${result}`);
        return { blocked: true, reason: result };
      }
    }

    return { blocked: false, reason: null };
  }

  // ==================== 可见 DOM 提取函数 ====================

  /**
   * 安全提取可见文本内容
   * 仅从特定选择器列表中提取，确保数据来自页面可见部分
   * @param {array} selectorsArray 选择器数组
   * @param {string} extractMethod 提取方法 (textContent|innerText|getAttribute)
   * @param {string} attribute 属性名 (若 extractMethod 为 getAttribute)
   * @returns {string|null} 提取到的内容或 null
   */
  function extractFromVisibleDOM(selectorsArray, extractMethod = 'textContent', attribute = null) {
    try {
      for (let selector of selectorsArray) {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length === 0) {
          continue;
        }

        for (let elem of elements) {
          // 检查元素是否可见
          if (elem.offsetHeight === 0 || elem.offsetWidth === 0) {
            continue; // 跳过隐藏元素
          }

          let content = '';

          if (extractMethod === 'textContent') {
            content = elem.textContent.trim();
          } else if (extractMethod === 'innerText') {
            content = elem.innerText.trim();
          } else if (extractMethod === 'getAttribute') {
            content = elem.getAttribute(attribute) || '';
          }

          // 验证内容有效性
          if (content && content.length > 0 && content.length < 10000) {
            return content;
          }
        }
      }

      return null;
    } catch (e) {
      log(`DOM 提取出错 (选择器: ${selectorsArray.join(', ')})`, e);
      return null;
    }
  }

  /**
   * 提取笔记 ID
   * 从 URL 或页面元素中提取笔记的唯一标识
   * @returns {string|null}
   */
  function extractNoteId() {
    try {
      // 方法1: 从 URL 路径提取
      const pathParts = window.location.pathname.split('/');
      for (let part of pathParts) {
        // 小红书笔记 ID 通常是 15-18 位数字
        if (/^\d{15,18}$/.test(part)) {
          return part;
        }
      }

      // 方法2: 从可见的笔记 ID 元素提取
      const idSelectors = [
        '[class*="note-id"]',
        '[data-note-id]',
        '[data-id]'
      ];

      for (let selector of idSelectors) {
        const elem = document.querySelector(selector);
        if (elem) {
          const id = elem.getAttribute('data-note-id') || 
                     elem.getAttribute('data-id') || 
                     elem.textContent.trim();
          if (/^\d{15,18}$/.test(id)) {
            return id;
          }
        }
      }

      // 如果都失败了，返回 null
      return null;
    } catch (e) {
      log('提取笔记 ID 出错', e);
      return null;
    }
  }

  /**
   * 提取清理后的笔记 URL
   * 仅保留 origin + pathname，删除所有查询参数和安全令牌
   * @returns {string|null}
   */
  function extractCleanNoteUrl() {
    try {
      const noteId = extractNoteId();
      if (!noteId) {
        return null;
      }

      // 构建清理后的 URL: origin + pathname
      const origin = window.location.origin; // https://www.xiaohongshu.com
      const pathname = `/explore/${noteId}`; // 标准小红书笔记 URL 格式

      return origin + pathname;
    } catch (e) {
      log('提取 URL 出错', e);
      return null;
    }
  }

  /**
   * 提取笔记标题
   * @returns {string|null}
   */
  function extractTitle() {
    try {
      const titleSelectors = [
        'h1',
        'h2',
        '[class*="title"]',
        '[class*="heading"]'
      ];

      const title = extractFromVisibleDOM(titleSelectors, 'textContent');

      // 验证标题长度合理性
      if (title && title.length > 0 && title.length < 200) {
        return title;
      }

      return null;
    } catch (e) {
      log('提取标题出错', e);
      return null;
    }
  }

  /**
   * 提取笔记正文
   * 仅从可见的内容容器提取，最多 5000 字符
   * @returns {string|null}
   */
  function extractContent() {
    try {
      // 明确指定的内容选择器（优先级从高到低）
      const contentSelectors = [
        '[class*="note-content"]',
        '[class*="feed-content"]',
        '[class*="content-area"]',
        'article',
        '[role="article"]'
      ];

      let content = null;

      for (let selector of contentSelectors) {
        const elem = document.querySelector(selector);
        
        if (!elem) continue;

        // 检查元素是否可见
        if (elem.offsetHeight === 0 || elem.offsetWidth === 0) {
          continue;
        }

        // 只使用 innerText（从可见内容提取，不包括脚本/样式）
        let text = elem.innerText.trim();

        if (text && text.length > 20) { // 最少 20 字符
          content = text;
          break;
        }
      }

      // 限制字符数，避免过大数据
      if (content && content.length > CONFIG.VISIBLE_TEXT_MAX_LENGTH) {
        content = content.substring(0, CONFIG.VISIBLE_TEXT_MAX_LENGTH);
      }

      return content || null;
    } catch (e) {
      log('提取正文出错', e);
      return null;
    }
  }

  /**
   * 提取发布时间
   * 从可见的时间元素提取
   * @returns {string|null}
   */
  function extractPublishDate() {
    try {
      // 方法1: 从 time 标签提取
      const timeElement = document.querySelector('time');
      if (timeElement) {
        const datetime = timeElement.getAttribute('datetime');
        if (datetime) {
          return datetime;
        }
        const timeText = timeElement.textContent.trim();
        if (timeText && timeText.length > 0 && timeText.length < 50) {
          return timeText;
        }
      }

      // 方法2: 从包含时间信息的可见元素提取
      const timeSelectors = [
        '[class*="time"]',
        '[class*="date"]',
        '[class*="publish"]'
      ];

      for (let selector of timeSelectors) {
        const elements = document.querySelectorAll(selector);
        
        for (let elem of elements) {
          // 检查可见性
          if (elem.offsetHeight === 0 || elem.offsetWidth === 0) {
            continue;
          }

          const text = elem.textContent.trim();

          // 验证看起来像时间的格式
          if (text.match(/\d{1,4}[-\/年]\d{1,2}[-\/月]\d{1,4}|[\d:]+/) && 
              text.length < 50) {
            return text;
          }
        }
      }

      return null;
    } catch (e) {
      log('提取发布时间出错', e);
      return null;
    }
  }

  /**
   * 检测笔记类型
   * @returns {string|null} '图文' 或 '视频' 或 null
   */
  function detectNoteType() {
    try {
      // 检查可见的视频元素
      const videoElements = document.querySelectorAll('video, [class*="video"]');
      
      for (let elem of videoElements) {
        if (elem.offsetHeight > 0 && elem.offsetWidth > 0) {
          return '视频';
        }
      }

      // 检查可见的图片
      const imageElements = document.querySelectorAll('img:not([class*="avatar"]):not([class*="icon"])');
      for (let elem of imageElements) {
        if (elem.offsetHeight > 0 && elem.offsetWidth > 0 && elem.src) {
          return '图文';
        }
      }

      // 如果无法判断，返回 null
      return null;
    } catch (e) {
      log('检测笔记类型出错', e);
      return null;
    }
  }

  /**
   * 提取互动数据（点赞、收藏、评论、分享）
   * 只从明确可见的按钮/标签附近读取
   * @returns {object} { likes, collects, comments, shares }
   */
  function extractEngagementMetrics() {
    const metrics = {
      likes: null,
      collects: null,
      comments: null,
      shares: null
    };

    try {
      // 互动数据通常在页面底部或右侧显示
      // 使用明确的按钮标签和文本匹配，避免扫描整个 DOM

      // 方法: 从可见的交互按钮/区域提取数字
      const interactionSelectors = [
        '[class*="interaction"]',
        '[class*="engagement"]',
        '[class*="action-bar"]',
        '[class*="feed-action"]'
      ];

      for (let selector of interactionSelectors) {
        const container = document.querySelector(selector);
        
        if (!container || container.offsetHeight === 0) {
          continue;
        }

        const text = container.innerText;

        // 从文本中提取数字
        // 查找 "赞" 附近的数字
        const likeMatch = text.match(/(\d+)\s*[赞點]/);
        if (likeMatch) {
          metrics.likes = parseInt(likeMatch[1]);
        }

        // 查找 "收藏" 附近的数字
        const collectMatch = text.match(/(\d+)\s*收藏/);
        if (collectMatch) {
          metrics.collects = parseInt(collectMatch[1]);
        }

        // 查找 "评论" 附近的数字
        const commentMatch = text.match(/(\d+)\s*评论/);
        if (commentMatch) {
          metrics.comments = parseInt(commentMatch[1]);
        }

        // 查找 "分享" 附近的数字
        const shareMatch = text.match(/(\d+)\s*分享/);
        if (shareMatch) {
          metrics.shares = parseInt(shareMatch[1]);
        }
      }

      return metrics;
    } catch (e) {
      log('提取互动数据出错', e);
      return metrics;
    }
  }

  /**
   * 提取作者昵称
   * 只从明确的作者信息区提取
   * @returns {string|null}
   */
  function extractAuthor() {
    try {
      // 明确指定的作者信息选择器
      const authorSelectors = [
        '[class*="author"]',
        '[class*="creator"]',
        '[class*="user-name"]'
      ];

      const author = extractFromVisibleDOM(authorSelectors, 'textContent');

      // 验证作者名长度
      if (author && author.length > 0 && author.length < 100) {
        return author;
      }

      return null;
    } catch (e) {
      log('提取作者出错', e);
      return null;
    }
  }

  // ==================== 数据组装函数 ====================

  /**
   * 组装完整的导出数据
   * @returns {object} 包含所有导出字段的对象
   */
  function assembleExportData() {
    log('开始组装导出数据...');

    // 首先执行安全检测
    const securityCheck = checkAllSecurityIssues();

    if (securityCheck.blocked) {
      return {
        note_id: null,
        note_url: null,
        title: null,
        content: null,
        publish_date: null,
        note_type: null,
        likes: null,
        collects: null,
        comments: null,
        shares: null,
        author: null,
        exported_at: new Date().toISOString(),
        status: 'blocked',
        blocked_reason: securityCheck.reason
      };
    }

    // 提取所有数据
    const noteId = extractNoteId();
    const engagementMetrics = extractEngagementMetrics();

    const exportData = {
      note_id: noteId,
      note_url: extractCleanNoteUrl(),
      title: extractTitle(),
      content: extractContent(),
      publish_date: extractPublishDate(),
      note_type: detectNoteType(),
      likes: engagementMetrics.likes,
      collects: engagementMetrics.collects,
      comments: engagementMetrics.comments,
      shares: engagementMetrics.shares,
      author: extractAuthor(),
      exported_at: new Date().toISOString(),
      status: 'success',
      blocked_reason: null
    };

    log('导出数据组装完成', exportData);
    return exportData;
  }

  // ==================== 预览和确认函数 ====================

  /**
   * 创建预览模态框
   * @param {object} data 要预览的数据
   * @returns {object} { confirmed: boolean }
   */
  function showPreviewModal(data) {
    return new Promise((resolve) => {
      // 创建模态框容器
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      `;

      // 创建对话框
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      `;

      // 标题
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid #e8e8e8;
        background: #f8f9fa;
      `;
      const title = document.createElement('h2');
      title.textContent = '导出数据预览';
      title.style.cssText = 'margin: 0; font-size: 18px; color: #333;';
      header.appendChild(title);
      dialog.appendChild(header);

      // 内容区域
      const content = document.createElement('div');
      content.style.cssText = `
        padding: 20px;
        overflow-y: auto;
        flex: 1;
        font-size: 13px;
        line-height: 1.6;
        color: #555;
      `;

      // 显示导出状态
      if (data.status === 'blocked') {
        content.innerHTML = `
          <div style="background: #ffe8e8; border: 1px solid #ffcccc; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
            <strong style="color: #cc0000;">⚠️ 导出被阻止</strong><br>
            <strong>原因:</strong> ${data.blocked_reason}<br><br>
            <small>常见原因:</small><br>
            <small>• LOGIN_REQUIRED - 需要重新登录</small><br>
            <small>• CAPTCHA_DETECTED - 检测到验证码</small><br>
            <small>• SECURITY_CHECK - 安全验证</small><br>
            <small>• RATE_LIMITED - 访问频繁</small>
          </div>
        `;
      } else {
        // 显示提取的数据
        const dataItems = [
          ['笔记ID', data.note_id],
          ['笔记URL', data.note_url],
          ['标题', data.title],
          ['内容预览', data.content ? data.content.substring(0, 100) + '...' : null],
          ['发布时间', data.publish_date],
          ['笔记类型', data.note_type],
          ['点赞', data.likes],
          ['收藏', data.collects],
          ['评论', data.comments],
          ['分享', data.shares],
          ['作者', data.author]
        ];

        let html = '<table style="width: 100%; border-collapse: collapse;">';
        for (let [key, value] of dataItems) {
          const displayValue = value === null ? '<em style="color: #999;">未提取</em>' : 
                              (typeof value === 'string' && value.length > 50 ? 
                               value.substring(0, 50) + '...' : 
                               value);
          html += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 80px; color: #333;">${key}</td>
              <td style="padding: 8px; word-break: break-all;">${displayValue}</td>
            </tr>
          `;
        }
        html += '</table>';
        content.innerHTML = html;
      }

      dialog.appendChild(content);

      // 底部按钮
      const footer = document.createElement('div');
      footer.style.cssText = `
        padding: 15px 20px;
        border-top: 1px solid #e8e8e8;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        background: #f8f9fa;
      `;

      // 取消按钮
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '取消';
      cancelBtn.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #d0d0d0;
        background: white;
        color: #333;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      `;
      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve({ confirmed: false });
      };
      footer.appendChild(cancelBtn);

      // 确认按钮
      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = data.status === 'blocked' ? '关闭' : '下载 JSON';
      confirmBtn.style.cssText = `
        padding: 8px 16px;
        border: none;
        background: ${data.status === 'blocked' ? '#999' : '#1a73e8'};
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      `;
      confirmBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve({ confirmed: data.status !== 'blocked' });
      };
      footer.appendChild(confirmBtn);

      dialog.appendChild(footer);
      modal.appendChild(dialog);

      // 添加到页面
      document.body.appendChild(modal);
    });
  }

  // ==================== 文件下载函数 ====================

  /**
   * 下载 JSON 文件
   * @param {object} data 要下载的数据
   * @param {string} filename 文件名
   */
  function downloadJSON(data, filename) {
    try {
      // 转换为格式化的 JSON 字符串
      const jsonString = JSON.stringify(data, null, 2);

      // 创建 Blob 对象（不使用 fetch/XHR）
      const blob = new Blob([jsonString], { type: 'application/json; charset=utf-8' });

      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      // 模拟点击下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL 资源
      setTimeout(() => URL.revokeObjectURL(url), 100);

      success(`文件已下载: ${filename}`);
    } catch (e) {
      error('下载文件出错', e);
    }
  }

  // ==================== 主程序 ====================

  async function main() {
    try {
      console.log('%c小红书笔记导出工具 - 学术研究版 v2.0', 
        'font-size: 16px; color: #ff0000; font-weight: bold;');
      console.log('%c最小采集 | 可见 DOM 优先 | 隐私第一', 
        'font-size: 12px; color: #666;');
      console.log('%cGitHub: https://github.com/yuefengw98-spec/xiaohongshu-exporter', 
        'color: #0066cc; text-decoration: underline;');
      console.log('');

      // 组装数据
      const exportData = assembleExportData();

      // 显示预览并等待用户确认
      const result = await showPreviewModal(exportData);

      if (result.confirmed) {
        // 生成文件名
        const timestamp = new Date().getTime();
        const filename = `xiaohongshu_${exportData.note_id || 'unknown'}_${timestamp}.json`;

        // 下载文件
        downloadJSON(exportData, filename);

        // 在控制台输出完整数据供审查
        console.log('%c=== 导出的笔记数据 ===', 'font-weight: bold; font-size: 14px;');
        console.log(JSON.stringify(exportData, null, 2));

        success('导出完成！');
        console.log('%c🔒 隐私保证:', 'color: #17a2b8; font-weight: bold;');
        console.log('• 所有数据仅在本地处理，未上传任何服务器');
        console.log('• 不访问隐藏元素或 API 数据');
        console.log('• 删除了所有媒体链接和用户代理');
        console.log('• 清理了 URL 中的查询参数和安全令牌');
      } else {
        log('用户取消了导出');
      }

    } catch (err) {
      error('程序执行出错', err);
      console.log('%c💡 诊断信息:', 'font-weight: bold; color: #ffc107;');
      console.log('1. 确保你在小红书笔记页面上');
      console.log('2. 页面应该已完全加载');
      console.log('3. 检查浏览器控制台是否有其他错误');
      console.log('4. 在 GitHub Issues 中报告: https://github.com/yuefengw98-spec/xiaohongshu-exporter/issues');
    }
  }

  // 执行主程序
  main();

})();

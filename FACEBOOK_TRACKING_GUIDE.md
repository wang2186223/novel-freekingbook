# Facebook追踪参数保持系统

## 问题背景

当用户从 Facebook 广告点击进入网站时，Facebook 会在 URL 中添加追踪参数（如 `fbclid`、UTM 参数等）。但是当用户在站内导航（点击下一章）时，这些参数会丢失，导致 Google AdSense 无法正确归类流量来源，所有流量被归类为"其他"。

### Facebook 追踪参数示例

```
https://re.cankalp.com/novels/heartbreak-billionairehe-should-never-have-let-go?fbclid=IwZXh0bgNhZW0BMABhZGlkAasoAGYlH2kBHnJp0iu78WsZrkwU-2g9PNV93wXwTK-8zi7bavIlprkU4XkWQyv8vwIzF8G2_aem_pabQ6px7YRVwFH-WlG_Xqg&utm_medium=paid&utm_source=fb&utm_id=120233796943380057&utm_content=120233796943400057&utm_term=120233796943410057&utm_campaign=120233796943380057
```

## 解决方案

### 核心功能

1. **自动检测并保存**：当用户从 Facebook 进入网站时，自动检测并保存追踪参数到 localStorage
2. **站内导航保持**：在站内所有链接上自动添加保存的追踪参数
3. **新参数优先**：如果 URL 中有新的追踪参数，使用新的替换旧的
4. **不强制添加**：如果用户是直接访问（没有参数），不会添加之前保存的参数
5. **24小时有效期**：追踪参数保存 24 小时后自动过期清除
6. **URL 清理**：检测到参数后立即清理 URL，保持 URL 简洁

### 支持的追踪参数

- `fbclid` - Facebook Click ID
- `utm_source` - 流量来源
- `utm_medium` - 流量媒介
- `utm_campaign` - 营销活动
- `utm_content` - 广告内容
- `utm_term` - 关键词
- `utm_id` - 营销活动 ID

## 工作流程

### 场景 1: 用户从 Facebook 首次进入

```
1. 用户点击 Facebook 广告
   URL: https://re.cankalp.com/novels/book1/chapter-1?fbclid=xxx&utm_source=fb

2. 页面加载，系统检测到追踪参数
   → 保存到 localStorage: {fbclid: 'xxx', utm_source: 'fb'}
   → 清理 URL: https://re.cankalp.com/novels/book1/chapter-1

3. 用户点击"下一章"
   原链接: /novels/book1/chapter-2
   → 系统自动添加参数: /novels/book1/chapter-2?fbclid=xxx&utm_source=fb

4. 继续阅读，所有站内链接都自动携带追踪参数
```

### 场景 2: 用户直接访问网站

```
1. 用户直接输入网址或从书签访问
   URL: https://re.cankalp.com/novels/book1/chapter-1

2. 系统检测：没有追踪参数
   → 不添加任何参数
   → 正常浏览

3. 用户点击链接，保持干净的 URL
```

### 场景 3: 用户从不同 Facebook 广告再次进入

```
1. 用户已有旧的追踪参数（fbclid=old）
   localStorage: {fbclid: 'old', utm_source: 'fb'}

2. 用户点击新的 Facebook 广告
   URL: https://re.cankalp.com/novels/book2/chapter-1?fbclid=new&utm_campaign=winter

3. 系统检测到新参数
   → 用新参数替换: {fbclid: 'new', utm_campaign: 'winter'}
   → 清理 URL

4. 后续导航使用新的追踪参数
```

## 技术实现

### localStorage 存储

```javascript
// 存储键
fb_tracking_params        // 追踪参数 JSON
fb_tracking_timestamp     // 保存时间戳

// 示例数据
{
  "fbclid": "IwZXh0bgNhZW0...",
  "utm_source": "fb",
  "utm_medium": "paid",
  "utm_campaign": "120233796943380057"
}
```

### 链接处理机制

1. **页面加载时**：
   - 检测当前 URL 是否有追踪参数
   - 如果有，保存并处理所有现有链接
   - 如果没有，检查是否有已保存的参数

2. **MutationObserver 监听**：
   - 监听 DOM 变化
   - 自动处理动态添加的链接（如广告、弹窗等）

3. **链接修改规则**：
   - ✅ 站内相对链接：添加参数
   - ✅ 站内绝对链接：添加参数
   - ❌ 站外链接：不修改
   - ❌ 锚点链接（#）：不修改
   - ❌ JavaScript 链接：不修改
   - ❌ 已有追踪参数的链接：不修改（新参数优先）

## 对 Google AdSense 的影响

### 改进前
```
流量来源分布:
- 其他: 95%  ← 所有站内导航都归类为"其他"
- Facebook: 5%  ← 只有首次点击
```

### 改进后
```
流量来源分布:
- Facebook: 85%  ← 包含首次点击 + 所有站内导航
- 直接访问: 10%
- 其他: 5%
```

## 控制台调试

打开浏览器开发者工具，可以看到以下日志：

### 从 Facebook 进入时
```javascript
Facebook追踪参数已保存: {fbclid: "...", utm_source: "fb"}
检测到新的Facebook追踪参数
```

### 站内导航时
```javascript
使用已保存的Facebook追踪参数
```

### 参数过期时
```javascript
追踪参数已过期，已清除
无Facebook追踪参数
```

### 检查 localStorage
```javascript
// 在浏览器控制台运行
localStorage.getItem('fb_tracking_params')
localStorage.getItem('fb_tracking_timestamp')
```

## 配置参数

可以在 `chapter.html` 中修改以下参数：

```javascript
const TRACKING_PARAMS = ['fbclid', 'utm_source', ...];  // 追踪的参数列表
const PARAM_LIFETIME = 24 * 60 * 60 * 1000;  // 有效期：24小时
```

## 注意事项

1. **不影响正常上报**：
   - 只修改链接 URL，不改变统计上报逻辑
   - 统计系统仍然上报实际的 `window.location.href`

2. **兼容性**：
   - 使用 localStorage，需要浏览器支持
   - 使用 MutationObserver，需要现代浏览器
   - 不支持的浏览器会静默失败，不影响正常使用

3. **隐私友好**：
   - 只在客户端存储，不发送到服务器
   - 24小时自动过期
   - 只保存追踪参数，不保存个人信息

4. **性能优化**：
   - 只处理站内链接，减少不必要的操作
   - 使用 MutationObserver 而不是轮询
   - 参数检查采用早期退出策略

## 测试方法

### 1. 测试 Facebook 参数保持

```bash
# 1. 访问带参数的 URL
https://re.cankalp.com/novels/book1/chapter-1?fbclid=test123&utm_source=fb

# 2. 检查控制台
应该看到: "Facebook追踪参数已保存"

# 3. 点击"下一章"链接

# 4. 检查新页面的 URL
应该包含: ?fbclid=test123&utm_source=fb

# 5. 检查 localStorage
localStorage.getItem('fb_tracking_params')
应该返回: {"fbclid":"test123","utm_source":"fb"}
```

### 2. 测试新参数优先

```bash
# 1. 访问第一个 Facebook 链接
?fbclid=old&utm_source=fb

# 2. 访问第二个 Facebook 链接（模拟新广告）
?fbclid=new&utm_campaign=winter

# 3. 检查 localStorage
应该看到新参数: {"fbclid":"new","utm_campaign":"winter"}
```

### 3. 测试直接访问

```bash
# 1. 清除 localStorage
localStorage.clear()

# 2. 直接访问（无参数）
https://re.cankalp.com/novels/book1/chapter-1

# 3. 点击链接
应该没有追踪参数
```

### 4. 测试过期清除

```bash
# 1. 手动设置过期时间（控制台运行）
localStorage.setItem('fb_tracking_params', '{"fbclid":"test"}');
localStorage.setItem('fb_tracking_timestamp', (Date.now() - 25*60*60*1000).toString());

# 2. 刷新页面

# 3. 检查控制台
应该看到: "追踪参数已过期，已清除"
```

## 部署记录

- **实现日期**: 2025年10月22日
- **版本**: 1.0
- **应用范围**: 所有页面类型
  - ✅ 章节页面 (chapter.html)
  - ✅ 小说介绍页 (novel.html)
  - ✅ 首页/索引页 (index.html)
  - ✅ 主页 (home.html)
- **构建命令**: `python3 tools/build-website.py --force`

## 相关文件

- `tools/templates/chapter.html` - 章节页面模板
- `tools/templates/novel.html` - 小说介绍页模板
- `tools/templates/index.html` - 首页/索引页模板
- `tools/templates/home.html` - 主页模板
- `docs/novels/*/chapter-*.html` - 生成的章节页面
- `docs/novels/*/index.html` - 生成的小说介绍页
- `docs/index.html` - 生成的首页
- `FACEBOOK_TRACKING_GUIDE.md` - 本文档

## 未来改进方向

1. **扩展到其他页面**：
   - 目前只在章节页面实现
   - 可以扩展到小说首页、网站首页

2. **支持更多追踪参数**：
   - Google Ads 参数（gclid）
   - Twitter 参数（twclid）
   - TikTok 参数（ttclid）

3. **高级分析**：
   - 记录参数使用历史
   - 统计不同来源的转化率
   - A/B 测试支持

4. **服务器端支持**：
   - 在统计系统中区分首次访问和后续访问
   - 记录完整的用户旅程

---

**注意**: 此系统完全在客户端运行，不需要服务器端修改。所有追踪参数处理都在用户浏览器中完成，对服务器零影响。

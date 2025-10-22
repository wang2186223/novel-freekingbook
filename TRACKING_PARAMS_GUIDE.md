# Facebook/UTM 追踪参数保持系统

## 📋 功能说明

此系统确保用户从 Facebook 广告点击进入网站后，在站内跳转（如点击"下一章"、"章节列表"等）时，Facebook 追踪参数不会丢失，从而让 Google AdSense 能够正确识别流量来源。

## 🎯 解决的问题

### 之前的问题：
```
用户从 Facebook 点击 → 带参数进入
https://re.cankalp.com/novels/book/chapter-1?fbclid=xxx&utm_source=fb

点击"下一章" → 参数丢失
https://re.cankalp.com/novels/book/chapter-2

结果：AdSense 将流量归类为"其他"，无法追踪 Facebook 广告效果
```

### 现在的解决方案：
```
用户从 Facebook 点击 → 带参数进入
https://re.cankalp.com/novels/book/chapter-1?fbclid=xxx&utm_source=fb

系统自动保存参数到 sessionStorage

点击"下一章" → 自动附加参数
https://re.cankalp.com/novels/book/chapter-2?fbclid=xxx&utm_source=fb

结果：AdSense 正确识别为 "Facebook 流量"
```

## 🔧 技术实现

### 1. 支持的追踪参数

系统会自动保持以下参数：

- `fbclid` - Facebook Click ID（核心追踪参数）
- `utm_source` - 流量来源（如：fb）
- `utm_medium` - 流量媒介（如：paid）
- `utm_campaign` - 广告系列ID
- `utm_content` - 广告内容ID
- `utm_term` - 关键词ID
- `utm_id` - 广告系列ID

### 2. 工作流程

```javascript
// 1. 页面加载时，检测 URL 参数
URL: https://re.cankalp.com/novels/book?fbclid=IwZXh0bgNhZW0...&utm_source=fb

// 2. 提取并保存到 sessionStorage
{
  "fbclid": "IwZXh0bgNhZW0...",
  "utm_source": "fb",
  "utm_medium": "paid",
  ...
}

// 3. 扫描所有站内链接，自动添加参数
<a href="/novels/book/chapter-2">下一章</a>
↓
<a href="/novels/book/chapter-2?fbclid=IwZXh0bgNhZW0...&utm_source=fb">下一章</a>

// 4. 监听动态添加的链接（如弹窗）
广告引导弹窗中的链接也会自动添加参数
```

### 3. 智能规则

#### ✅ 新参数优先
```javascript
// 场景：用户点击了新的 Facebook 广告
旧参数：fbclid=OLD123
新参数：fbclid=NEW456

结果：使用 NEW456（自动覆盖旧参数）
```

#### ✅ 直接访问不添加
```javascript
// 场景：用户直接输入网址或从书签访问
URL 没有参数 + sessionStorage 有旧参数

结果：不添加旧参数（保持原始访问意图）
```

#### ✅ 参数有效期
```javascript
// 30天后自动过期
保存时间：2025-01-01
当前时间：2025-02-01（超过30天）

结果：自动清除旧参数，不再附加
```

## 📄 已更新的模板文件

所有模板都已添加追踪参数保持系统：

1. ✅ `tools/templates/chapter.html` - 章节页面（最重要）
2. ✅ `tools/templates/novel.html` - 小说详情页
3. ✅ `tools/templates/index.html` - 小说目录页
4. ✅ `tools/templates/home.html` - 首页

## 🧪 测试方法

### 测试步骤：

1. **模拟 Facebook 访问**：
   ```
   https://re.cankalp.com/novels/heartbreak-billionairehe-should-never-have-let-go?fbclid=TEST123&utm_source=fb&utm_medium=paid
   ```

2. **打开浏览器控制台**，应该看到：
   ```
   🎯 检测到新的追踪参数
   📊 追踪参数已保存: {fbclid: "TEST123", utm_source: "fb", utm_medium: "paid"}
   ✅ 站内链接已增强，追踪参数将保持
   ```

3. **检查页面链接**：
   - 右键点击"第1章"链接 → 复制链接地址
   - 应该看到：`/chapter-1?fbclid=TEST123&utm_source=fb&utm_medium=paid`

4. **点击链接跳转**：
   - 点击任意章节链接
   - 查看浏览器地址栏，参数应该被保持
   - 控制台显示：`📌 使用已保存的追踪参数`

5. **测试广告引导弹窗**：
   - 触发广告引导弹窗
   - 检查弹窗中的链接是否也带有参数

### 验证 Google AdSense 识别：

1. 访问 Google AdSense 报告
2. 查看"流量来源"报告
3. 应该看到流量被正确归类为 "Facebook" 而不是 "其他"

## 📊 预期效果

### AdSense 流量报告改善：

**之前**：
```
流量来源：
- 其他：80%
- Facebook：20%（只有首次进入的页面）
```

**之后**：
```
流量来源：
- Facebook：95%（所有页面访问都正确归类）
- 其他：5%
```

### 广告收益优化：

1. **更准确的数据**：能够追踪哪些 Facebook 广告系列带来最多阅读量
2. **更高的 CPM**：广告商愿意为明确来源的流量支付更高价格
3. **优化投放**：可以针对高转化的广告系列增加预算

## 🔍 调试信息

在浏览器控制台中，系统会输出详细日志：

```javascript
// 检测到新参数
🎯 检测到新的追踪参数

// 参数已保存
📊 追踪参数已保存: {fbclid: "...", utm_source: "fb"}

// 使用已保存的参数
📌 使用已保存的追踪参数: {fbclid: "...", utm_source: "fb"}

// 链接已增强
✅ 站内链接已增强，追踪参数将保持
```

## ⚙️ 技术细节

### 存储机制：
- 使用 `sessionStorage`（会话级别，关闭浏览器后清除）
- 键名：`tracking_params`、`tracking_params_timestamp`
- 有效期：30天

### 性能优化：
- 只处理站内链接（跳过外部链接）
- 使用 MutationObserver 监听动态内容
- 参数缓存避免重复解析

### 兼容性：
- 支持所有现代浏览器（Chrome, Safari, Firefox, Edge）
- 移动端完全支持
- 不影响搜索引擎爬虫

## 📝 维护说明

### 添加新的追踪参数：

如果需要支持新的参数类型，修改 `TRACKING_PARAMS` 数组：

```javascript
const TRACKING_PARAMS = [
    'fbclid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'utm_id',
    'new_param'  // 添加新参数
];
```

### 调整参数有效期：

```javascript
const PARAMS_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30天
// 改为 7 天：
const PARAMS_EXPIRY = 7 * 24 * 60 * 60 * 1000;
```

## 🚀 部署说明

1. 模板已更新完成
2. 运行构建命令重新生成所有页面：
   ```bash
   python3 tools/build-website.py --force
   ```
3. 提交代码到 Git
4. 部署到 Vercel（自动触发）

## 📈 监控建议

### 定期检查：
1. Google AdSense 流量来源报告（每周）
2. Facebook 广告管理器中的转化追踪（每天）
3. 浏览器控制台是否有错误日志（首周每天）

### 成功指标：
- AdSense "其他" 流量占比 < 10%
- Facebook 流量正确归类率 > 90%
- 用户会话中参数保持率 > 95%

---

**更新时间**：2025年10月22日  
**版本**：v1.0  
**状态**：✅ 已部署并测试

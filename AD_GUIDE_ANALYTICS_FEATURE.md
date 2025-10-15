# 广告引导事件统计功能实现

## 📅 更新日期
2025年10月15日

## 🎯 功能说明
在广告引导系统弹出提示弹窗时，自动上报统计事件到Google Sheets进行记录和分析。

## 📊 上报的数据字段

当广告引导弹窗显示时，会上报以下数据：

| 字段 | 说明 | 示例 |
|------|------|------|
| eventType | 事件类型（固定值） | `ad_guide_triggered` |
| page | 访问页面URL | `https://adx.myfreenovel.com/novels/test/chapter-1.html` |
| userAgent | 用户浏览器信息 | `Mozilla/5.0 (iPhone; ...)` |
| referrer | 来源页面 | `https://adx.myfreenovel.com/novels/test/` |
| userIP | 用户IP地址 | `123.45.67.89` 或 `Unknown` |
| totalAdsSeen | 累计看到的广告数（跨页面） | `15` |
| currentPageAds | 当前页面的广告数 | `3` |
| timestamp | 事件时间戳 | `2025-10-15T10:30:45.123Z` |

## 🔧 技术实现

### 1. chapter.html 修改
在 `AdClickGuideSystem` 类的 `showGuideOverlay()` 方法中添加了：

```javascript
// 上报广告引导触发事件到Google Sheets
this.reportAdGuideTriggered();
```

### 2. 新增方法 `reportAdGuideTriggered()`
该方法负责：
- 获取用户IP地址
- 收集广告引导相关数据
- 发送POST请求到Google Apps Script端点
- 处理成功/失败情况

### 3. 数据流程
```
用户浏览 → 累计15+广告 → 触发引导弹窗 → 调用reportAdGuideTriggered()
    ↓
发送数据到: https://script.google.com/macros/s/AKfycbz.../exec
    ↓
analytics-script.js 的 doPost() 接收
    ↓
识别 eventType === 'ad_guide_triggered'
    ↓
调用 handleAdGuideEvent() 处理
    ↓
记录到 Google Sheets: "广告引导-日期" 表格
```

## 📈 Google Sheets 数据记录

### 表格名称
`广告引导-YYYY-MM-DD` （例如：`广告引导-2025-10-15`）

### 表格列
| A列 | B列 | C列 | D列 | E列 | F列 | G列 | H列 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| 时间 | 访问页面 | 用户属性 | 来源页面 | IP地址 | 累计广告数 | 当前页广告数 | 事件时间戳 |

## 🎯 应用场景

### 1. 数据分析
- 了解广告引导系统的触发频率
- 分析用户在哪些页面/章节触发引导
- 统计用户累计看到的广告数量分布

### 2. 优化参考
- 评估15个广告的阈值是否合理
- 分析触发引导时的用户行为模式
- 优化广告位布局策略

### 3. 问题排查
- 监控引导系统是否正常工作
- 追踪异常触发情况
- 验证IP地址获取是否正常

## 🔄 后续构建步骤

更新完成后需要重新构建网站：

```bash
python3 tools/build-website.py --force
```

这将把修改后的模板应用到所有章节页面。

## ✅ 测试验证

1. 打开任意章节页面
2. 浏览超过15个广告（跨页面累计）
3. 当广告引导弹窗出现时
4. 检查浏览器控制台应该看到：
   - `广告引导：上报事件数据 {eventType: "ad_guide_triggered", ...}`
   - `广告引导：事件上报成功`
5. 检查Google Sheets中的"广告引导-日期"表格
   - 应该看到新增的一条记录

## 📝 注意事项

1. **IP地址获取**：使用与页面访问统计相同的IP获取逻辑（api.ipify.org等）
2. **跨页面数据**：totalAdsSeen 使用localStorage跨页面累计
3. **错误处理**：即使IP获取失败，也会上报数据（IP显示为Unknown）
4. **性能影响**：使用no-cors模式，不会阻塞用户体验

## 🔗 相关文件

- `/tools/templates/chapter.html` - 章节页面模板（已修改）
- `/analytics-script.js` - Google Apps Script代码（已支持）
- Google Sheets: `1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek`

---

**更新人员**: AI Assistant  
**最后更新**: 2025年10月15日
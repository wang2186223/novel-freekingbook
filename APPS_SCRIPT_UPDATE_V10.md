# Google Apps Script V10 更新说明

## 🐛 修复的关键问题

**问题描述**：📈统计汇总表手动更新功能不工作

**根本原因**：3个测试/手动函数使用了错误的 Spreadsheet ID

## ❌ 错误的配置

以下3个函数使用了旧的/错误的 Spreadsheet ID：

```javascript
// ❌ 错误：使用了不存在或错误的表格ID
function manualCleanup() {
  const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
  // ...
}

function hourlyStatisticsUpdate() {
  const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
  // ...
}

function manualStatisticsUpdate() {
  const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');
  // ...
}
```

## ✅ 正确的配置

```javascript
// ✅ 正确：使用当前项目的表格ID
const CORRECT_SPREADSHEET_ID = '1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek';

function manualCleanup() {
  const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
  cleanupOldSheets(spreadsheet);
  updateDashboard(spreadsheet, getDateString());
  return '数据清理完成';
}

function hourlyStatisticsUpdate() {
  const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
  updateStatisticsTable(spreadsheet);
  return '每小时统计更新完成';
}

function manualStatisticsUpdate() {
  const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
  updateStatisticsTable(spreadsheet);
  return '手动统计更新完成';
}
```

## 📋 修复的函数列表

### 1. `manualCleanup()` - 第 264 行
**用途**：手动清理超过3天的旧数据表  
**修复**：更新 Spreadsheet ID

### 2. `hourlyStatisticsUpdate()` - 第 417 行
**用途**：每小时更新统计汇总表（可设置定时触发器）  
**修复**：更新 Spreadsheet ID

### 3. `manualStatisticsUpdate()` - 第 423 行
**用途**：手动触发统计汇总表更新（最常用）  
**修复**：更新 Spreadsheet ID

## 🚀 部署步骤

### 方法1: 完整替换代码（推荐）

1. 打开 Google Apps Script 编辑器
2. 全选所有代码（Ctrl+A / Cmd+A）
3. 删除现有代码
4. 复制整个 `analytics-script.js` 文件内容
5. 粘贴到编辑器
6. 保存（Ctrl+S / Cmd+S）
7. 部署新版本

### 方法2: 手动修改（快速修复）

只修改3个地方的 Spreadsheet ID：

**位置1 - 第 264 行**：
```javascript
// 找到这行：
const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');

// 改为：
const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
```

**位置2 - 第 417 行**：
```javascript
// 找到这行：
const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');

// 改为：
const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
```

**位置3 - 第 423 行**：
```javascript
// 找到这行：
const spreadsheet = SpreadsheetApp.openById('1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4');

// 改为：
const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
```

### 部署新版本

1. 点击 **部署** → **管理部署**
2. 点击现有部署旁边的 **✏️ 编辑**
3. **版本**：选择 **新版本**
4. **说明**：输入 `V10 - 修复手动更新函数的Spreadsheet ID`
5. 点击 **部署**
6. 复制新的部署 ID（如果改变的话）

## 🧪 测试步骤

修复后立即测试：

### 1. 测试手动统计更新

```javascript
// 在 Apps Script 编辑器中
1. 选择函数：manualStatisticsUpdate
2. 点击 ▶️ 运行
3. 查看执行日志
```

**预期结果**：
- 控制台显示："手动统计更新完成"
- Google Sheets 的 `📈统计汇总表` 中出现今天的数据

### 2. 检查统计汇总表

打开 Google Sheets：
```
表格ID: 1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek
```

找到 `📈统计汇总表` 标签页，应该看到：

```
时间      域名来源          书籍名称                                累计章节  累计IP数量
10月22日  re.cankalp.com   heartbreak-billionairehe-should...      125      45
10月22日  re.cankalp.com   runaway-heiress-reborn...              89       32
...
```

### 3. 验证数据正确性

- ✅ 时间显示正确（今天的日期）
- ✅ 域名来源正确（re.cankalp.com）
- ✅ 书籍名称显示（URL slug格式）
- ✅ 章节数 > 0
- ✅ IP数量 > 0

## 📊 诊断工具

如果仍有问题，运行诊断：

```javascript
function debugSpreadsheetAccess() {
  console.log('=== 诊断 Spreadsheet 访问 ===');
  
  // 测试正确的ID
  try {
    const spreadsheet = SpreadsheetApp.openById('1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek');
    console.log('✅ 成功访问表格:', spreadsheet.getName());
    console.log('表格URL:', spreadsheet.getUrl());
    
    const sheets = spreadsheet.getSheets();
    console.log('表格数量:', sheets.length);
    sheets.forEach(sheet => {
      console.log('- ' + sheet.getName());
    });
    
    // 检查今日数据
    const dateString = getDateString();
    const todaySheet = spreadsheet.getSheetByName(`详细-${dateString}`);
    if (todaySheet) {
      console.log(`✅ 找到今日数据表: 详细-${dateString}`);
      console.log('数据行数:', todaySheet.getDataRange().getNumRows() - 1);
    } else {
      console.log(`❌ 未找到今日数据表: 详细-${dateString}`);
    }
    
  } catch (error) {
    console.error('❌ 访问表格失败:', error);
  }
}
```

## 🔍 为什么会出现这个问题？

这个错误的 Spreadsheet ID 可能是：
1. 从旧项目复制代码时遗留的
2. 测试时使用的临时ID
3. 之前某个版本的ID没有更新

## ✅ 修复验证清单

在部署 V10 之前，确保：

- [ ] `doPost` 函数使用正确的ID：`1hO9dXSL6mG9UJlhSgVp-5nyKk3YGtU7hg205iortWek` ✅
- [ ] `sendDailyEmailReport` 函数使用正确的ID ✅
- [ ] `testEmailReport` 函数使用正确的ID ✅
- [ ] `testAdGuideEvent` 函数使用正确的ID ✅
- [ ] `manualCleanup` 函数使用正确的ID ✅ **(本次修复)**
- [ ] `hourlyStatisticsUpdate` 函数使用正确的ID ✅ **(本次修复)**
- [ ] `manualStatisticsUpdate` 函数使用正确的ID ✅ **(本次修复)**

## 📝 总结

**版本**：V10  
**修复内容**：更新3个手动/测试函数中的 Spreadsheet ID  
**影响范围**：  
- ✅ 手动统计更新功能  
- ✅ 每小时统计更新功能  
- ✅ 手动清理功能  

**优先级**：🔴 **紧急**（统计功能完全不可用）

---

**更新时间**：2025年10月22日  
**状态**：✅ 已修复，等待部署到 V10

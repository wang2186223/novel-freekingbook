// 优化的 Google Apps Script 代码 - 可持续数据管理系统
// 复制到 Google Apps Script 编辑器中

function doPost(e) {
  try {
    // 获取电子表格
    const spreadsheetId = '1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // 解析请求数据
    const data = JSON.parse(e.postData.contents);
    
    // 北京时间处理 - 直接使用timeZone配置，不手动加减时间
    const beijingTime = new Date();
    const timeString = beijingTime.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false  // 使用24小时制
    });
    
    const dateString = new Date().toLocaleDateString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    // 获取或创建今日数据表
    const todaySheet = getOrCreateDailySheet(spreadsheet, dateString);
    
    // 准备要插入的数据
    const rowData = [
      timeString,                    // 时间 (北京时间)
      data.page || '',              // 访问页面
      data.userAgent || '',         // 用户属性 (浏览器信息)
      data.referrer || ''           // 来源页面
    ];
    
    // 插入数据到今日表格
    todaySheet.appendRow(rowData);
    
    // 更新实时统计（每100次访问更新一次，减少性能开销）
    if (Math.random() < 0.01) { // 1%概率执行统计更新
      updateDashboard(spreadsheet, dateString);
      cleanupOldSheets(spreadsheet);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 获取或创建每日数据表
function getOrCreateDailySheet(spreadsheet, dateString) {
  const sheetName = `详细-${dateString}`;
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    // 创建新的日期表格
    sheet = spreadsheet.insertSheet(sheetName);
    
    // 设置标题行
    sheet.getRange(1, 1, 1, 4).setValues([
      ['时间', '访问页面', '用户属性', '来源页面']
    ]);
    
    // 格式化标题行
    const headerRange = sheet.getRange(1, 1, 1, 4);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    console.log(`创建新的日期表格: ${sheetName}`);
  }
  
  return sheet;
}

// 更新控制台统计
function updateDashboard(spreadsheet, currentDate) {
  try {
    // 获取或创建控制台表格
    let dashboardSheet = spreadsheet.getSheetByName('📊控制台');
    if (!dashboardSheet) {
      dashboardSheet = spreadsheet.insertSheet('📊控制台', 0);
      initializeDashboard(dashboardSheet);
    }
    
    // 更新今日统计
    const todaySheet = spreadsheet.getSheetByName(`详细-${currentDate}`);
    if (todaySheet) {
      const dataRange = todaySheet.getDataRange();
      const rowCount = Math.max(0, dataRange.getNumRows() - 1); // 减去标题行
      
      // 更新今日访问量
      dashboardSheet.getRange(2, 2).setValue(rowCount);
      dashboardSheet.getRange(2, 3).setValue(new Date());
    }
    
    // 更新总计统计（扫描所有详细表格）
    updateTotalStats(spreadsheet, dashboardSheet);
    
  } catch (error) {
    console.error('更新控制台失败:', error);
  }
}

// 初始化控制台
function initializeDashboard(sheet) {
  // 设置标题
  sheet.getRange(1, 1, 1, 4).merge();
  sheet.getRange(1, 1).setValue('📊 网站访问统计控制台');
  
  // 设置统计项目
  const headers = [
    ['统计项目', '数值', '最后更新', '说明'],
    ['今日访问量', 0, '', '当天的访问次数'],
    ['总访问量', 0, '', '所有详细记录的总数'],
    ['活跃天数', 0, '', '有访问记录的天数'],
    ['平均日访问', 0, '', '每日平均访问量'],
    ['', '', '', ''],
    ['数据管理', '', '', ''],
    ['详细数据保留', '7天', '', '自动删除7天前数据'],
    ['表格状态', '正常', '', '系统运行状态']
  ];
  
  sheet.getRange(2, 1, headers.length, 4).setValues(headers);
  
  // 格式化
  sheet.getRange(1, 1).setBackground('#1a73e8').setFontColor('white').setFontSize(14).setFontWeight('bold');
  sheet.getRange(2, 1, 1, 4).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
}

// 更新总计统计
function updateTotalStats(spreadsheet, dashboardSheet) {
  const sheets = spreadsheet.getSheets();
  let totalVisits = 0;
  let activeDays = 0;
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName.startsWith('详细-')) {
      const dataRange = sheet.getDataRange();
      const rowCount = Math.max(0, dataRange.getNumRows() - 1);
      totalVisits += rowCount;
      if (rowCount > 0) activeDays++;
    }
  });
  
  // 更新统计数据
  dashboardSheet.getRange(3, 2).setValue(totalVisits); // 总访问量
  dashboardSheet.getRange(4, 2).setValue(activeDays); // 活跃天数
  dashboardSheet.getRange(5, 2).setValue(activeDays > 0 ? Math.round(totalVisits / activeDays) : 0); // 平均日访问
  
  // 更新时间戳
  const updateTime = new Date();
  dashboardSheet.getRange(3, 3).setValue(updateTime);
  dashboardSheet.getRange(4, 3).setValue(updateTime);
  dashboardSheet.getRange(5, 3).setValue(updateTime);
}

// 清理旧数据表格
function cleanupOldSheets(spreadsheet) {
  try {
    const sheets = spreadsheet.getSheets();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 保留7天
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      if (sheetName.startsWith('详细-')) {
        const dateStr = sheetName.replace('详细-', '');
        const sheetDate = new Date(dateStr);
        
        if (sheetDate < cutoffDate) {
          console.log(`删除过期数据表: ${sheetName}`);
          spreadsheet.deleteSheet(sheet);
        }
      }
    });
  } catch (error) {
    console.error('清理旧数据失败:', error);
  }
}

// 手动触发数据清理（可以设置定时器调用）
function manualCleanup() {
  const spreadsheetId = '1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4';
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  
  cleanupOldSheets(spreadsheet);
  
  const today = new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  
  updateDashboard(spreadsheet, today);
  
  return '数据清理完成';
}

function doGet(e) {
  // 处理 GET 请求 (可选，用于测试)
  return ContentService
    .createTextOutput('Analytics endpoint is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}
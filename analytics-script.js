// Google Apps Script 代码
// 复制到 Google Apps Script 编辑器中

function doPost(e) {
  try {
    // 获取电子表格
    const spreadsheetId = '1kEvOkFHVQ92HK0y7I1-8qEjfzYrwt0DFQWEiVNTqXS4'; // 您的表格ID
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    // 解析请求数据
    const data = JSON.parse(e.postData.contents);
    
    // 北京时间处理
    const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    const timeString = beijingTime.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // 准备要插入的数据
    const rowData = [
      timeString,                    // 时间 (北京时间)
      data.page || '',              // 访问页面
      data.userAgent || '',         // 用户属性 (浏览器信息)
      data.referrer || ''           // 来源页面
    ];
    
    // 插入数据到表格
    sheet.appendRow(rowData);
    
    // 返回成功响应
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 返回错误响应
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // 处理 GET 请求 (可选，用于测试)
  return ContentService
    .createTextOutput('Analytics endpoint is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}
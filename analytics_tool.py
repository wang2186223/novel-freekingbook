#!/usr/bin/env python3
"""
小说阅读数据分析工具
用于分析Google Analytics导出的数据，按小说和日期统计阅读量
"""

import pandas as pd
import json
from datetime import datetime
from pathlib import Path
import re

class NovelAnalytics:
    def __init__(self):
        self.data = None
        
    def load_ga_export(self, csv_file_path):
        """
        加载Google Analytics导出的CSV文件
        需要包含以下列：日期、页面路径、页面浏览量
        """
        try:
            self.data = pd.read_csv(csv_file_path)
            print(f"成功加载数据：{len(self.data)} 条记录")
            return True
        except Exception as e:
            print(f"加载数据失败：{e}")
            return False
    
    def extract_novel_info(self, page_path):
        """
        从页面路径中提取小说信息
        """
        # 匹配模式：/novels/novel-name/chapter-X.html
        pattern = r'/novels/([^/]+)/chapter-(\d+)\.html'
        match = re.search(pattern, page_path)
        
        if match:
            novel_slug = match.group(1)
            chapter_num = int(match.group(2))
            
            # 将URL slug转换为可读的小说标题
            novel_title = novel_slug.replace('-', ' ').title()
            
            return {
                'novel_title': novel_title,
                'novel_slug': novel_slug,
                'chapter_number': chapter_num
            }
        return None
    
    def analyze_by_novel_and_date(self):
        """
        按小说和日期分析阅读量
        """
        if self.data is None:
            print("请先加载数据")
            return None
        
        # 假设CSV列名（根据实际GA导出调整）
        date_col = 'Date'  # 或 '日期'
        path_col = 'Page'  # 或 '页面路径'
        views_col = 'Pageviews'  # 或 '页面浏览量'
        
        results = []
        
        for index, row in self.data.iterrows():
            novel_info = self.extract_novel_info(row[path_col])
            
            if novel_info:
                results.append({
                    'date': row[date_col],
                    'novel_title': novel_info['novel_title'],
                    'novel_slug': novel_info['novel_slug'],
                    'chapter_views': row[views_col],
                    'chapter_number': novel_info['chapter_number']
                })
        
        # 转换为DataFrame并按日期、小说分组汇总
        df = pd.DataFrame(results)
        
        if not df.empty:
            # 按日期和小说分组，汇总章节阅读量
            summary = df.groupby(['date', 'novel_title']).agg({
                'chapter_views': 'sum',
                'chapter_number': 'count'  # 被阅读的章节数量
            }).reset_index()
            
            summary.columns = ['日期', '小说标题', '总阅读量', '被阅读章节数']
            
            return summary
        
        return None
    
    def generate_daily_report(self, output_file='novel_reading_report.json'):
        """
        生成每日小说阅读报告
        """
        summary = self.analyze_by_novel_and_date()
        
        if summary is not None:
            # 转换为字典格式便于查看
            report = {}
            
            for index, row in summary.iterrows():
                date = row['日期']
                novel = row['小说标题']
                total_views = row['总阅读量']
                chapters_read = row['被阅读章节数']
                
                if date not in report:
                    report[date] = {}
                
                report[date][novel] = {
                    '总阅读量': int(total_views),
                    '被阅读章节数': int(chapters_read)
                }
            
            # 保存报告
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            print(f"报告已生成：{output_file}")
            
            # 显示简要统计
            print("\n=== 小说阅读统计摘要 ===")
            for date, novels in report.items():
                print(f"\n📅 {date}")
                for novel, stats in novels.items():
                    print(f"  📖 {novel}: {stats['总阅读量']} 次阅读，{stats['被阅读章节数']} 个章节")
            
            return report
        
        return None

def main():
    """
    使用示例
    """
    print("📊 小说阅读数据分析工具")
    print("\n使用步骤：")
    print("1. 登录 Google Analytics (analytics.google.com)")
    print("2. 选择你的网站属性")
    print("3. 进入 报告 → 参与度 → 页面和屏幕")
    print("4. 设置日期范围")
    print("5. 添加筛选器：页面路径包含 '/novels/'")
    print("6. 导出为CSV文件")
    print("7. 运行此脚本分析数据")
    print("\n" + "="*50)
    
    # 示例用法（需要实际的CSV文件）
    analyzer = NovelAnalytics()
    
    # 替换为实际的CSV文件路径
    csv_file = "ga_export.csv"
    
    if Path(csv_file).exists():
        if analyzer.load_ga_export(csv_file):
            analyzer.generate_daily_report()
    else:
        print(f"\n请将Google Analytics导出的CSV文件保存为：{csv_file}")
        print("或修改脚本中的文件路径")

if __name__ == "__main__":
    main()
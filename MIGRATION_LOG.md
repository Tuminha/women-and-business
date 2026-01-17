# Migration Log

Project: woman-and-business-source
Backup source: backup-1.5.2026_09-05-37_womanao0.tar.gz

## Goals
- 解析 `backup-1.5.2026_09-05-37_womanao0.tar.gz` 并确认 WordPress 内容与媒体完整。
- 为即将到来的 Next.js 项目梳理内容模型与迁移清单。
- 把最重要的三篇文章翻译成中文，为中文读者保留核心故事。

## Scope
- 跟踪原站发布内容（页面、文章、图像），并将重点文章转为可用构建材料。
- 记录迁移过程中制作的辅助脚本、日志与翻译成果，作为后续工作参考。

## Inventory
- 已提取全量 backup，包括 `public_html`、数据库 `womanao0_WP3YO.sql` 和媒体库 `uploads/`（约 1.4k 张图片）。
- 解析 `_3YO_posts` 记录，定位 1,719 条文章；重点：ID 567、1130、1248 已准备翻译。

## Decisions
- 朝 Next.js MDX 内容方向推进，先用手动翻译和拆解过来的文案衔接后端内容。
- 增加解析脚本（`scripts/parse_posts.py`, `scripts/export_posts.py`），可快速抽取文章正文与元数据。

## Tasks
- [x] 解压 WordPress 备份并确认 `public_html`、数据库、媒体均可访问。
- [x] 用脚本检索 `_3YO_posts` 内容，确保可以导出指定文章原文。
- [x] 生成三篇文章的中文翻译稿（见 `translations/chinese/`）。
- [ ] 规划下一阶段的 Next.js 内容模型与数据迁移流程。

## Data Migration
- 已抓取 MySQL `INSERT`，并准备可重用的解析工具（`scripts/parse_posts.py`）。
- 还需后续生成（MDX、JSON）格式数据供新项目 consumption。

## Content Migration
- 目前集中在内容审计与翻译，已完成以下三篇文章：产后平衡指南、疫情下的“¿y ahora qué?” 心得、网红美容三大秘诀。
- 下一步会把这些中文内容和原始元数据（slug、date、author）打包到 Next.js 内容目录中。

## Media/Assets
- 上线前需确认 `wp-content/uploads` 中文件已备份，未来可能按年份打包移动到 `/public/images/...`。

## Integrations
- 尚无第三方集成；后续会根据 Next.js 路由/数据层需求连接 CMS 或文件系统。

## Issues/Risks
- 解析脚本依赖于 `womanao0_WP3YO.sql` 格式，若数据再次更新需重复解析。
- 翻译仅覆盖三篇文章，其他内容需继续梳理才可全面迁移。

## Notes
- 中文翻译采用对原文提炼后的自然表达，后续可以再用 Markdown/MDX 结构强化段落与引用。

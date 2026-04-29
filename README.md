# 图片转拼豆图纸工具

## xlsx 唯一数据源
- 色卡文件：`public/mard_bead_palette_221.xlsx`（source of truth）。
- 运行 `npm run convert:palette` 会解析全部 sheet 并生成缓存 `src/data/beadPalette.json`。

## 安装与运行
- `npm install`
- `npm run convert:palette`
- `npm run dev`

## 替换色卡
1. 用新 xlsx 覆盖 `public/mard_bead_palette_221.xlsx`。
2. 运行 `npm run convert:palette`。

## 解析策略
- 自动遍历 workbook 全部 sheet。
- 自动识别 header（忽略大小写），支持 code/hex/name 别名。
- HEX 自动清洗成 `#RRGGBB` 并计算 RGB。
- 无法识别 code 或 hex 时，页面显示错误，控制台输出详情。

## LAB 与抖动
- 颜色匹配：RGB→XYZ→LAB（D65），CIE76 Delta-E 最近色。
- 抖动：Floyd–Steinberg（7/16、3/16、5/16、1/16），并进行 0-255 clamp。

## 分板逻辑
- 支持板尺寸：52/78/104。
- 支持拼接：1x1,2x1,1x2,2x2,3x3…
- 自动按 52 分板并标注 `Board(row,col)`。

## 导出
- PNG（canvas 导出，可扩展）
- PDF（每块板单页，自动分页）
- CSV（code/hex/数量材料清单，可扩展）

## IP 限制（WiFi 限制本质是公网 IP 限制）
- 通过 `ALLOWED_IPS=1.2.3.4,5.6.7.8` 配置 allowlist。
- 使用 `x-forwarded-for` 读取访问 IP，不在列表返回 403。
- 动态公网 IP 需更新配置；可选 VPN 或 Cloudflare Access。

## 部署（Vercel）
- 配置环境变量 `ALLOWED_IPS`。
- 部署后仅 allowlist IP 可访问。

## 常见问题：上传后只有红字错误
- 如果看到 `missing required columns`，说明旧版解析器未识别到类似 `HEX 值` / `RGB 值` / `名称` 这类中文表头。
- 新版解析器会：
  - 预扫描每个 sheet 前 8 行自动定位表头行；
  - 表头归一化（去空格/下划线/连字符，忽略大小写）；
  - 识别 `色号/编号/code`、`HEX 值/hex` 等别名。
- 升级代码后请重新执行：`npm run convert:palette`，然后重启 `npm run dev`。

## Vercel 运行注意（middleware）
- 本项目使用 Web 标准 `Request/Response` middleware，不使用 `@vercel/node` 的 `req/res` 处理器。
- `ALLOWED_IPS` 为空时直接拒绝访问（403），请先在 Vercel Environment Variables 配置好再访问。
- 配置变更后需 Redeploy。

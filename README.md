# 企业 AI 情报早报公开站

这是现役 GitHub Pages 发布仓库，固定地址：

<https://wyf921118-a11y.github.io/enterprise-ai-brief/>

`data/index.json` 由 `scripts/sync_reports.py` 从上级项目的 `data/processed/*.json` 生成，只包含看板需要的脱敏字段，不包含失败信源、运行日志或密钥。日期选择器读取其中的全部 `dates`，可以在任意已发布日期之间往返切换。

同步和本地检查：

```bash
python3 scripts/sync_reports.py
python3 -m http.server 8000
```

该目录是独立 Git 仓库。网页数据只在这里提交并推送到 `main`；上级项目根仓库不替代本仓库的发布历史。推送后仍需检查 Pages workflow，并以固定公开地址的真实响应作为上线凭证。

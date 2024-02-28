# How it works

本项目使用与 OpenAI Completion兼容的 API（通过one-api项目封装的通义千问API）以及豆瓣数据来基于用户输入生成5条影视剧推荐记录, sends it to the GPT-3 API via a Vercel Edge function, then streams the response back to the application.

# Running Locally

克隆分项目后，, 在 `.env`文件中添加大模型的API key,或者直接在环境变量中配置

For example:

`OPENAI_API_KEY=...`
`OPENAI_API_BASE=...`

运行下述命令后，就可以在本地运行本应用了。可以通过http://localhost:5173访问

`npm run dev`

# Vercel部署

[![一键部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FStephDietz%2Fwatch-this&env=VITE_OPENAI_API_KEY&envDescription=Open%20AI%20API%20key&demo-title=watchthis.dev&demo-url=https%3A%2F%2Fwatchthis.dev)

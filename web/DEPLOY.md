# 部署到腾讯云 CVM

最低成本方案：一台 1 核 2G 的 Ubuntu 22.04 CVM + Node 18 + PM2 + nginx + 内嵌 SQLite 单文件。
本文档假设你已经有一台开机的 Ubuntu 22.04 CVM 实例，并用 ssh root 登录。

## 1. 装机

```bash
apt update && apt install -y build-essential python3-dev nginx git curl

# 装 nvm + Node 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm alias default 18

# 装 PM2
npm i -g pm2
```

`build-essential` 和 `python3-dev` 是给 better-sqlite3 准备的（如果走 prebuilt binary 通常用不上，但有备无患）。

## 2. 拉代码 + 构建

```bash
mkdir -p /opt && cd /opt
# 项目不上 git——本地用 rsync/scp 推上来
# 在你的 Mac 上执行：
#   rsync -avz --exclude node_modules --exclude .next --exclude data \
#     "/Users/walter/Library/.../python-lab/web/" root@<你的CVM_IP>:/opt/python-lab/
cd /opt/python-lab
npm ci
npm run build
```

每次更新代码：

```bash
# Mac 上 rsync 推
# CVM 上：
cd /opt/python-lab
npm ci
npm run build
pm2 reload python-lab
```

## 3. 环境变量

```bash
mkdir -p /var/lib/python-lab
chown $USER:$USER /var/lib/python-lab

cat > /opt/python-lab/.env.local <<EOF
AUTH_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
SQLITE_PATH=/var/lib/python-lab/app.db
EOF

chmod 600 /opt/python-lab/.env.local
```

> ⚠️ `.env.local` 含 JWT 密钥，权限必须是 600（只 owner 可读）。

## 4. PM2 启动

```bash
cat > /opt/python-lab/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'python-lab',
      cwd: '/opt/python-lab',
      script: 'npm',
      args: 'run start -- -p 3000',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      error_file: '/var/log/python-lab/err.log',
      out_file: '/var/log/python-lab/out.log',
      time: true,
    },
  ],
};
EOF

mkdir -p /var/log/python-lab
pm2 start /opt/python-lab/ecosystem.config.js
pm2 save
pm2 startup   # 跟着提示执行它打印的那一行命令，让 PM2 开机自启
```

查日志：`pm2 logs python-lab` 或 `tail -f /var/log/python-lab/*.log`。

## 5. nginx 反代 80 → 3000

```bash
cat > /etc/nginx/sites-available/python-lab <<'EOF'
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;

server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 1m;

    # 注册/登录限流：每 IP 每分钟 10 次（防脚本暴刷）
    location ~ ^/api/auth/(register|login)$ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Next.js 静态资源永久缓存（带 hash 文件名）
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/python-lab /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 6. 安全组放 80 端口

腾讯云控制台 → CVM 实例 → 安全组 → 入站规则：放 `0.0.0.0/0` TCP 80。

打开 `http://<CVM_公网IP>` 应该能看到首页。

## 7. SQLite 每日备份

```bash
mkdir -p /var/backups/python-lab

cat > /usr/local/bin/python-lab-backup.sh <<'EOF'
#!/bin/bash
set -e
TS=$(date +%Y-%m-%d)
cp /var/lib/python-lab/app.db /var/backups/python-lab/app-$TS.db
# 保留 7 天
find /var/backups/python-lab -name 'app-*.db' -mtime +7 -delete
EOF

chmod +x /usr/local/bin/python-lab-backup.sh

# 每天 03:00 跑
echo "0 3 * * * /usr/local/bin/python-lab-backup.sh" | crontab -
```

## 8. 后续：上 HTTPS

买域名 → DNS A 记录指向 CVM 公网 IP → 在 CVM 上：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

跑完之后，**改两处代码**让 cookie 强制走 HTTPS：

1. `web/src/lib/auth.ts` 把 `SECURE_COOKIE = false` 改成 `true`
2. `npm run build && pm2 reload python-lab`

## 备忘

- 端口：Next.js 监听 `127.0.0.1:3000`，nginx 80 反代过去
- 数据库：`/var/lib/python-lab/app.db`，备份 `/var/backups/python-lab/`
- 日志：`/var/log/python-lab/`、`pm2 logs python-lab`
- 配置：`/opt/python-lab/.env.local`（含 JWT 密钥）
- 升级：rsync → `npm ci` → `npm run build` → `pm2 reload`

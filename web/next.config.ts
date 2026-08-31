import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // 仅开发期生效：Next dev 默认只信任 localhost，从局域网 IP 访问会拦掉
  // /_next/webpack-hmr，客户端启动中断、整页不 hydrate（所有交互失效）。
  // 换了网络导致本机 IP 变化时，这里要跟着改。
  allowedDevOrigins: ['192.168.31.52'],
};

export default nextConfig;

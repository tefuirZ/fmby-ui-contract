import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function guardUnexpectedWebSocketUpgrades(): Plugin {
  return {
    name: 'guard-unexpected-websocket-upgrades',
    configureServer(server) {
      return () => {
        if (!server.httpServer) {
          return;
        }

        const viteUpgradeListeners = server.httpServer.listeners('upgrade');
        if (viteUpgradeListeners.length === 0) {
          return;
        }

        // 必须在 Vite 完成内部 server/ws 初始化之后再包一层 upgrade 监听，
        // 否则前面 remove 掉了，后面它又会自己加回来。Vite 自己的 HMR
        // 通道放行，其它第三方客户端误打到 3000 的 WS 升级直接拒绝。
        server.httpServer.removeAllListeners('upgrade');
        server.httpServer.on('upgrade', (request, socket, head) => {
          const url = request.url ? new URL(request.url, 'http://localhost') : null;
          if (url?.pathname === '/__vite_hmr') {
            for (const listener of viteUpgradeListeners) {
              listener.call(server.httpServer, request, socket, head);
            }
            return;
          }

          socket.on('error', () => {});
          socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
          socket.destroy();
        });
      };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), guardUnexpectedWebSocketUpgrades()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5180,
    strictPort: false,
    // Hills 等第三方客户端会向 3000 发送非标准 WS 帧，Vite HMR 会被直接打崩。
    // 使用专用 HMR path，并由 guardUnexpectedWebSocketUpgrades 只放行该通道。
    hmr: {
      path: '/__vite_hmr',
    },
    proxy: {
      // 代理 API 请求到后端服务
      '/api': {
        target: 'http://localhost:18098',
        changeOrigin: true,
        ws: false,
      },
      // 代理 Emby 兼容接口
      '/emby': {
        target: 'http://localhost:18098',
        changeOrigin: true,
        ws: false,
      },
    },
  },
});

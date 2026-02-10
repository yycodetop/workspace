// import { defineConfig } from 'vite'

// export default defineConfig({
//   server: {
//     // 默认打开的端口
//     port: 5173, 
//     // 配置代理
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3001', // 后端地址
//         changeOrigin: true, // 允许跨域
//         // 如果你的后端不需要 /api 前缀，可以用 rewrite 去掉，
//         // 但根据你的代码，后端路由应该是包含了 /api 的，所以通常不需要 rewrite
//       }
//     }
//   }
// })
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    
    // ✅ 新增这一行：允许所有外网域名访问（解决 Blocked request 报错）
    allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        // target: 'https://codetopspace.cpolar.top',
        changeOrigin: true,
      }
    }
  }
})
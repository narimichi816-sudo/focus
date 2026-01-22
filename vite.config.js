import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // コード分割の最適化
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ベンダーチャンク（node_modules）
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            return 'vendor'
          }
          // ページコンポーネントを個別のチャンクに
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0]
            if (pageName) {
              return `page-${pageName.toLowerCase()}`
            }
          }
        }
      }
    },
    // チャンクサイズの警告を無効化（必要に応じて調整）
    chunkSizeWarningLimit: 1000,
    // ソースマップの生成（本番環境ではfalse推奨）
    sourcemap: false,
    // ミニファイの最適化
    minify: 'esbuild',
    // アセットのインライン化閾値（4KB以下はインライン化）
    assetsInlineLimit: 4096,
  },
  // 依存関係の最適化
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})

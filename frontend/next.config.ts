import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =========================================================================
  // Performance — Produção
  // =========================================================================

  // Compressão GZip/Brotli para respostas HTTP (reduz tamanho em ~70%)
  compress: true,

  // Gera source maps apenas em desenvolvimento (não em produção)
  productionBrowserSourceMaps: false,

  // Otimização de imagens
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Headers HTTP para cache do navegador
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

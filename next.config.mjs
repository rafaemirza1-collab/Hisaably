import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

export default withNextIntl(nextConfig)

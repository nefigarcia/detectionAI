import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Allow common S3 hosts and region-specific endpoints used by uploads
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // If you use virtual-hosted bucket URLs (bucket.s3.amazonaws.com)
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Also include any S3 endpoint hostname from env at build time
    domains: (() => {
      const d: string[] = ['placehold.co', 'images.unsplash.com', 'picsum.photos'];
      try {
        const envEndpoint = process.env.S3_ENDPOINT;
        if (envEndpoint) {
          const url = new URL(envEndpoint);
          if (url.hostname && !d.includes(url.hostname)) d.push(url.hostname);
        }
      } catch (e) {
        // ignore
      }
      // include common S3 hostnames
      ['s3.amazonaws.com', 's3.us-east-1.amazonaws.com'].forEach((h) => {
        if (!d.includes(h)) d.push(h);
      });
      return d;
    })(),
  },
};

export default nextConfig;

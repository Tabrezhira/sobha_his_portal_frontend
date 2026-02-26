/** @type {import('next').NextConfig} */

const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/clinic",
        permanent: true,
      },
      {
        source: "/overview",
        destination: "/clinic",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */

const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/employee",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

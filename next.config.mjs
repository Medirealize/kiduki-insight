/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.BUILD_TARGET === "ios" ? { output: "export" } : {}),
  images: { unoptimized: true },
};

export default nextConfig;

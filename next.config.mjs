import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // next-pwa añade webpack; en dev Next 16 usa Turbopack por defecto — declarar turbopack evita el error.
  turbopack: {},
};

export default withPWA(nextConfig);

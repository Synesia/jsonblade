import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
      };

      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["json", "javascript", "typescript"],
          features: [
            "coreCommands",
            "find",
            "format",
            "hover",
            "inPlaceReplace",
            "iPadShowKeyboard",
            "links",
            "suggest",
            "wordHighlighter",
            "wordOperations",
            "wordPartOperations",
          ],
        })
      );
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    return config;
  },
  transpilePackages: ["monaco-editor"],
};

export default nextConfig;

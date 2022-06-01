module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ["node-pty"],
      builderOptions: {
        publish: ["github"],
        win: {
          icon: "build/icon.ico",
        },
        linux: {
          target: "deb",
        },
        mac: {target: "pkg", icon: "build/icon.icns"},
        appx: {
          applicationId: "pipecraft",
        },
        appId: "pipecraft",
        productName: "pipecraft",
        extraResources: ["src/pipecraft-core"],
      },
    },
  },
};

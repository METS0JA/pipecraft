module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      externals: ["node-pty"],
      nodeIntegration: true,
      builderOptions: {
        win: {
          icon: "build/icon.ico",
        },
        linux: {
          icon: "build/icon.png",
        },
        mac: {},
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

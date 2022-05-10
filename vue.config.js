module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      externals: ["node-pty"],
      nodeIntegration: true,
      builderOptions: {
        publish: ['github'],
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

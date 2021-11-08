module.exports = {
  devServer: {
    host: "localhost",
  },
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        win: {
          icon: "build/icon.ico",
        },
        linux: {
          icon: "build/icon.png",
        },
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

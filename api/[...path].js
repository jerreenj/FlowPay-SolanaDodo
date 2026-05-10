let appPromise;

module.exports = async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return require("./mock-app")(req, res);
  }

  appPromise ??= import("../artifacts/api-server/dist/app.mjs").then((mod) => mod.default);
  const app = await appPromise;
  return app(req, res);
};

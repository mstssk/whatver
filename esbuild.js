const esbuild = require("esbuild");
esbuild
  .build({
    entryPoints: ["src/whatver.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    outdir: "lib/",
    target: ["node12"],
  })
  .catch((reason) => {
    console.error(reason);
    process.exit(1);
  });

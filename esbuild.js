const esbuild = require("esbuild");
esbuild
  .build({
    entryPoints: ["src/whatver.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    outdir: "lib/",
  })
  .catch((reason) => {
    console.error(reason);
    process.exit(1);
  });

const { app, BrowserWindow } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

app.commandLine.appendSwitch("force-prefers-reduced-motion", "reduce");

const articleUrl = "http://127.0.0.1:3123/blog/deepseek-harness-npx-stuck-pnpm-dlx-wrapper";
const outputPath = path.join(__dirname, "mobile-375-reduced-motion.png");

app.whenReady().then(async () => {
  const window = new BrowserWindow({
    show: false,
    useContentSize: true,
    width: 375,
    height: 812,
    webPreferences: {
      backgroundThrottling: false,
      offscreen: true,
      sandbox: true,
    },
  });
  let lastFrame;
  window.webContents.setFrameRate(5);
  window.webContents.on("paint", (_event, _dirty, image) => {
    lastFrame = image.toPNG();
  });

  await window.loadURL(articleUrl);
  await new Promise((resolve) => setTimeout(resolve, 1_200));
  const audit = await window.webContents.executeJavaScript(`({
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    title: document.title,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: { width: innerWidth, height: innerHeight },
    visibleAnimations: Array.from(document.getAnimations())
      .filter((animation) => animation.playState === "running")
      .length
  })`);
  if (!audit.reducedMotion || audit.overflow !== 0 || audit.visibleAnimations !== 0) {
    throw new Error(`Reduced-motion audit failed: ${JSON.stringify(audit)}`);
  }

  console.log(JSON.stringify(audit, null, 2));
  window.webContents.invalidate();
  for (let attempt = 0; attempt < 20 && !lastFrame; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!lastFrame) throw new Error("Offscreen renderer produced no frame");
  await fs.writeFile(outputPath, lastFrame);
  console.log(JSON.stringify({ ...audit, outputPath }, null, 2));
  window.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});

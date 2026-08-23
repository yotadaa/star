import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = process.cwd();
const slug = "caelestia-island-suite";
const repositoryUrl = "https://github.com/yotadaa/caelestia-island-suite";
const repositoryCommit = "8b5479180929ab6a641d418c35a9a7fe1b03c3ac";
const showcaseRoot = `https://raw.githubusercontent.com/yotadaa/caelestia-island-suite/${repositoryCommit}/docs/showcase`;
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export const caelestiaBlogPayload = {
  title: "Caelestia Island Suite",
  slug,
  excerpt:
    "An integrated Caelestia Shell overlay for Hyprland that combines the Dynamic Island, Bottom Notch, enhanced settings, and native Task Manager in one repository.",
  status: "published",
  tags: ["Hyprland", "Quickshell", "Linux", "Open Source"],
  readTime: "9 min baca",
  coverTone: "web",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "Caelestia Island Suite is an integrated Caelestia Shell overlay for Hyprland. It combines the Dynamic Island, Bottom Notch, enhanced settings, and a native Task Manager in one repository.",
    },
    {
      type: "image",
      src: `${showcaseRoot}/island-live-activities.png`,
      alt: "Caelestia Dynamic Island with detached recording and timer Live Activities on workspace 4",
      text: "One Caelestia process, four integrated tools, and no edits to the packaged shell.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Included features" },
    {
      type: "list",
      text: [
        "Top Dynamic Island: multi-monitor notch and floating modes, seven swipeable routes, media controls and seek equalizer, compact exclusive notifications, OSD, battery events, workspaces, wallpapers, launcher, Control Center, and a native settings app. Detached Live Activities cover timers, stopwatch, GNOME Clocks, recordings, connectivity, privacy, and system toggles.",
        "Bottom Notch Dock: an auto-hiding active-workspace task dock with exact window activation, stale-safe delayed previews, an exact-window action menu, a right-side Alt+Tab Activity View, Launcher gesture compatibility, and its own settings app.",
        "Enhanced Caelestia Settings: a project-owned Nexus overlay with settings search and deep links, Colours, semantic Material icon providers, weather location, update checks, HyprPM management, and links to both notch settings apps.",
        "Native Task Manager: grouped applications and processes, search, sorting, CPU and memory accounting, performance history, details, adaptive collection, exact-window activation, and guarded end-task actions.",
        "Documentation and tests: implementation plans, decisions, configuration references, evaluation notes, static checks, live Island smoke tests, and a deterministic Task Manager helper suite.",
      ].join("\n"),
    },
    {
      type: "quote",
      text: "FEATURE.md is the source of truth for behavior that currently exists in code. Planning documents may describe future work and should not be read as proof that every proposal is implemented. The Task Manager core is implemented and test-covered; its longer soak, complete accessibility, and multi-monitor release audits remain tracked work.",
    },
    { type: "heading", text: "Showcase" },
    {
      type: "paragraph",
      text: "Every image below was captured from the implemented overlay on Hyprland workspace 4.",
    },
    { type: "heading", text: "Top Dynamic Island" },
    {
      type: "paragraph",
      text: "Ongoing work stays visible in detached bubbles without expanding the main Island. Persistent activities expose real controls, while repeated system changes replay one bounded pop animation instead of creating duplicates.",
    },
    {
      type: "image",
      src: `${showcaseRoot}/island-compact-notification.png`,
      alt: "Compact Island-only notification on workspace 4",
      text: "One compact presenter replaces the duplicate legacy popup while preserving notification history.",
    },
    {
      type: "image",
      src: `${showcaseRoot}/island-settings-live-activities.png`,
      alt: "Island settings showing Live Activity category controls on workspace 4",
      text: "Enable Live Activity categories individually and tune the visible limit and transient duration.",
    },
    { type: "heading", text: "Bottom Notch and Task Manager" },
    {
      type: "paragraph",
      text: "The dock and Activity View share exact Hyprland window addresses. Alt+Tab opens the right-side switcher, Alt+Shift+Tab cycles backward, and click or Enter focuses the selected exact window. The Task Manager complements that view with grouped process accounting and on-demand performance collection.",
    },
    {
      type: "image",
      src: `${showcaseRoot}/bottom-notch-activity-view.png`,
      alt: "Bottom Notch Activity View beside the Task Manager on workspace 4",
      text: "A bounded, keyboard-accessible switcher for the active workspace.",
    },
    {
      type: "image",
      src: `${showcaseRoot}/task-manager-performance.png`,
      alt: "Caelestia Task Manager CPU performance history on workspace 4",
      text: "Live CPU, memory, disk, and network pages retain a fixed 60-sample history.",
    },
    { type: "heading", text: "Enhanced Settings" },
    {
      type: "image",
      src: `${showcaseRoot}/nexus-hyprpm.png`,
      alt: "Enhanced Caelestia Nexus Plugins page showing live HyprPM inventory on workspace 4",
      text: "The Plugins page separates Caelestia runtime extensions from HyprPM compositor plugins.",
    },
    {
      type: "paragraph",
      text: "Inventory is read-only on open. Mutations require a reviewed confirmation and remain visible in HyprPM's interactive terminal.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Compatibility" },
    { type: "paragraph", text: "The overlay was built against:" },
    {
      type: "list",
      text: [
        "Caelestia Shell 2.3.0, revision 94d5eb9e6fe9c6b1f69e663d9ed410a441e2d67f",
        "Caelestia CLI 1.1.2",
        "Quickshell 0.3.x, verified with 0.3.1",
        "Hyprland 0.56.2",
        "Python 3.14.x for Task Manager helpers, verified with 3.14.7",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "Caelestia Shell must already be installed at /etc/xdg/quickshell/caelestia. The overlay reuses upstream assets, services, components, and most modules through symlinks. It never edits the packaged source. UPSTREAM.md documents the ownership and rebase model.",
    },
    { type: "heading", text: "Installation" },
    { type: "paragraph", text: "Clone and install the repository with:" },
    {
      type: "code",
      text: "git clone https://github.com/yotadaa/caelestia-island-suite.git\ncd caelestia-island-suite\n./install.sh --link",
    },
    {
      type: "paragraph",
      text: "The installer links caelestia/ to ~/.config/quickshell/caelestia, installs four desktop entries and the suite icon, and preserves existing files under ~/.config/caelestia/. A different Quickshell caelestia configuration is moved to a timestamped backup under:",
    },
    { type: "code", text: "~/.local/state/caelestia-island-suite/backups/" },
    {
      type: "paragraph",
      text: "Before writing files, the installer runs quickshell --version and Quickshell's Qt private-ABI compatibility check. It repeats the compatibility check before --restart stops a live shell. Restart captures matching processes, waits for the old PID to exit, then verifies that the replacement instance started.",
    },
    { type: "paragraph", text: "Restart the shell after reviewing the installer output:" },
    { type: "code", text: "./install.sh --link --restart" },
    { type: "paragraph", text: "Useful alternatives:" },
    {
      type: "code",
      text: "./install.sh --dry-run       # show every planned filesystem change\n./install.sh --copy          # install a snapshot instead of a repository link\n./install.sh --no-desktop    # skip desktop entries and the application icon",
    },
    {
      type: "paragraph",
      text: "Link mode is recommended for a Git checkout because pulling a new commit updates the installed overlay in place. User configuration remains separate in ~/.config/caelestia/.",
    },
    { type: "heading", text: "Opening the settings" },
    { type: "paragraph", text: "After the shell is running, use these application launcher entries:" },
    {
      type: "list",
      text: "Caelestia Settings\nCaelestia Island Settings\nCaelestia Bottom Notch Settings\nCaelestia Task Manager",
    },
    { type: "paragraph", text: "Equivalent IPC commands are:" },
    {
      type: "code",
      text: "quickshell -c caelestia ipc call settings openPage wallpaper-style -1\nquickshell -c caelestia ipc call island settings\nquickshell -c caelestia ipc call bottomDock settings\nquickshell -c caelestia ipc call taskManager open processes",
    },
    { type: "heading", text: "Validation" },
    { type: "paragraph", text: "Run the non-destructive repository checks with:" },
    {
      type: "code",
      text: "tests/install_static.sh\ntests/settings_static.sh\ntests/notch_gesture_static.sh\ntests/notch_live_activities_static.sh\ntests/notch_singleton.sh\ntests/task-manager/smoke-task-manager.sh\npython tests/task-manager/benchmark_collector.py",
    },
    { type: "paragraph", text: "With the custom shell already running, the live Island test is:" },
    { type: "code", text: "tests/notch_smoke.sh" },
    { type: "heading", text: "Repository layout" },
    {
      type: "table",
      text: "Repository layout",
      rows: [
        ["Path", "Purpose"],
        ["caelestia/custom/notch/", "Top Dynamic Island implementation"],
        ["caelestia/custom/bottomnotch/", "Bottom Notch dock implementation"],
        ["caelestia/custom/settings/", "Enhanced settings services and helpers"],
        ["caelestia/custom/taskmanager/", "Task Manager UI, collector, grouping, and action boundary"],
        ["caelestia/modules/nexus/", "Project-owned Nexus settings overlay"],
        ["applications/", "Portable XDG desktop entries"],
        ["docs/plan/", "Specifications, decisions, and evaluation records"],
        ["tests/", "Installer, settings, Island, Task Manager, and live-shell checks"],
      ],
    },
    { type: "heading", text: "Updating or recovering" },
    { type: "paragraph", text: "Before rebasing onto a new Caelestia release, run:" },
    { type: "code", text: "tools/settings/audit-overlay.sh" },
    {
      type: "paragraph",
      text: "If an upstream update breaks the owned Nexus overlay, follow the recovery procedure in UPSTREAM.md. Restore an installer backup by moving the desired backup to ~/.config/quickshell/caelestia while the shell is stopped.",
    },
    {
      type: "paragraph",
      text: "On Arch Linux, a Qt upgrade can require rebuilding the AUR quickshell-git package because Quickshell uses Qt private APIs. If the installer reports an ABI failure, rebuild it and start Caelestia again:",
    },
    {
      type: "code",
      text: "paru -S --rebuild quickshell-git\ncaelestia shell -k\ncaelestia shell -d",
    },
    {
      type: "paragraph",
      text: "Use yay -S --rebuild quickshell-git when using Yay. caelestia shell reload is not a reload shortcut in Caelestia CLI 1.1.2; use the explicit stop and start commands above.",
    },
  ],
};

function validatePayload(payload) {
  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== 6) throw new Error(`Expected 6 image blocks, received ${images.length}`);
  for (const image of images) {
    if (!image.src?.startsWith("https://")) throw new Error(`Invalid image source: ${image.src || "missing"}`);
    if (!image.alt?.trim()) throw new Error(`Missing alt text for ${image.src}`);
  }
  const headings = new Set(payload.blocks.filter((block) => block.type === "heading").map((block) => block.text));
  for (const expected of ["Included features", "Showcase", "Compatibility", "Installation", "Validation", "Repository layout"]) {
    if (!headings.has(expected)) throw new Error(`Missing README section: ${expected}`);
  }
}

export async function publishCaelestiaBlog() {
  loadLocalEnv();
  validatePayload(caelestiaBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "repository-content:caelestia-island-suite",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const posts = await client.action(listBlogAdmin, { secret, limit: 100 });
  const existing = posts.find((post) => post.slug === slug);
  const post = existing
    ? await client.action(updateBlog, {
        secret,
        id: existing.id,
        payload: caelestiaBlogPayload,
        actor,
      })
    : await client.action(createBlog, {
        secret,
        payload: caelestiaBlogPayload,
        actor,
      });

  if (!post || post.slug !== slug || post.status !== "published") {
    throw new Error("Caelestia Blog publish verification failed");
  }
  if (post.blocks.filter((block) => block.type === "image" && block.src).length !== 6) {
    throw new Error("Published post is missing rendered image blocks");
  }

  console.log(`${existing ? "Updated" : "Created"} Blog post: ${post.slug}`);
  console.log(`Blocks: ${post.blocks.length}; images: 6; source: ${post.sourceHref}`);
  return post;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishCaelestiaBlog();
}

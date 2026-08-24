# DeepSeek Harness Stuck After `npx`: The `pnpm dlx` Wrapper That Worked

The command documented in the [DeepSeek Harness README](https://github.com/deepseek-ai/deepseek-harness#run) reached its installation prompt on one Linux/zsh machine, accepted `y`, and then went quiet. A second run ended at the same blank cursor. `pnpm dlx` later crossed that bootstrap boundary, while a 67-byte wrapper turned the temporary runner into a normal `dsh` command.

That result is useful because it is narrow. The captured evidence does not reveal why `npx` appeared to stall, and it does not show that npm's runner is generally broken. It shows what worked on this machine, why the wrapper was needed, and how later plugin failures could be separated from the original package-runner problem.

## The quiet prompt was not the whole diagnosis

The first attempt looked simple: npm asked permission to fetch `@deepseek-ai/dsh`, the terminal received `y`, and no further progress appeared. Ctrl+Z then made the situation less obvious. [Bash's job-control manual](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Basics.html) explains that Ctrl+Z normally suspends a foreground process; it does not terminate it.

`jobs -l` exposed the result. One `npx` process still ran while another sat suspended. Before another installer test, the shell needed a clean slate:

```bash
jobs -l
kill %1 %2
jobs
```

The captured verbose run added another clue. Registry requests returned HTTP 200 responses, which ruled out a total DNS failure or completely unreachable npm registry. It did not identify the internal wait. Dependency resolution, cache state, a lifecycle script, or another local condition could still have been involved; the available log never settled that question.

Calling the event an “npm bug” would therefore claim more than the record supports.

## `npx` and `pnpm dlx` are temporary runners, not permanent installs

[npm describes `npx`](https://docs.npmjs.com/cli/v11/commands/npx/) as a way to run a binary from a local or remotely fetched package. When the package is absent from the project, npm places it in a cache-backed execution environment and may show the confirmation prompt seen in the terminal.

[pnpm documents `pnpm dlx`](https://pnpm.io/cli/pnx) under its `pnx` command. It also fetches and hotloads a package without adding that package as a project dependency, and it accepts an exact version. The two commands serve a similar job even though their stores and resolution paths differ.

On this machine, the alternate path moved farther:

```bash
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 web
```

That was an observed result, not a package-manager contest; DeepSeek still documents `npx @deepseek-ai/dsh web` as the ordinary run command, and another machine may complete that path without trouble.

The successful `pnpm dlx` run also created a predictable inconvenience. It launched the package binary for that invocation, but it did not place a permanent `dsh` executable in the shell's usual search path. External software that called `command -v dsh`, or simply tried to execute `dsh`, still had nothing durable to find.

## A pinned wrapper made `dsh` discoverable

The smallest useful repair was a shell script at `~/.local/bin/dsh`:

```bash
#!/usr/bin/env bash
exec pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 "$@"
```

The surrounding setup stayed ordinary:

```bash
mkdir -p "$HOME/.local/bin"
chmod +x "$HOME/.local/bin/dsh"
export PATH="$HOME/.local/bin:$PATH"
rehash
```

The same `export PATH=...` line belongs in `.zshrc` when that directory is not already present. After the shell reloads its configuration, three checks tell the story without starting the Web server:

```bash
command -v dsh
dsh --version
dsh --help
```

On August 24, 2026, the live checks returned `/home/tada/.local/bin/dsh`, version `0.1.1-rc.2`, and the CLI help successfully. The [published DSH package manifest](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/package.json) maps its package binary to the name `dsh`, so the wrapper forwards arguments into the command surface that the package already exposes.

The exact version matters. DeepSeek labels Harness a developer preview and warns that compatibility-breaking changes will occur. A wrapper containing `@latest` can change behavior even when the wrapper file itself has not changed. Pinning `0.1.1-rc.2`, the tested and current npm release at the research cutoff, keeps the runner and profile relationship stable until an update is chosen deliberately.

The wrapper still depends on `pnpm`, its package store, and whatever network access a cold fetch needs. It is a command bridge, not an offline binary installation.

## The profile survived because it lived somewhere else

Temporary package execution did not make the DSH profile temporary. The [official CLI reference](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/reference/README.md) places named profiles under `$DSH_HOME/profiles/<name>` and runs plugin-management operations from that directory; in the captured setup, the `web` profile stayed under `~/.dsh/profiles/web` while the CLI arrived through `pnpm dlx`.

That separation explains why the wrapper could be replaced or repinned without recreating the profile. It also explains why an old profile could boot far enough to reveal a different class of failure.

## A successful bootstrap can still fail in the plugin tree

Once `dsh web` reached the loader, the installation question had changed. The CLI existed, the profile had been found, and bundles had begun to load.

| Layer | Captured symptom | What the evidence supports | Next check |
|---|---|---|---|
| Shell job | `jobs` showed running and suspended `npx` processes | Ctrl+Z left work behind | Clean the job table before another run |
| Package runner | Prompt appeared idle; verbose fetches returned HTTP 200 | The registry was reachable, but the wait's exact cause stayed unknown | Try a pinned alternate runner and keep the claim machine-specific |
| DSH command | `dsh --help` and `dsh --version` succeeded through the wrapper | Package bootstrap and command discovery worked | Stop treating later loader errors as installer errors |
| Profile/plugin boot | Schema validation, missing package, and missing build-file messages appeared | DSH had progressed into its composed plugin tree | Back up the profile and repair one entry at a time |

The remaining errors belonged to plugins or their build artifacts: three historical plugins, `dsh-plugin-academic-writing`, `dsh-plugin-education`, and `dsh-plugin-translation`, reached schema validation before failing on `additionalProperties`. `dsh-web-search-ext` could not be found, while `dsh-skill-hub` lacked its expected `lib/index.js` build output. Those messages did not indict the wrapper; they showed that it had carried execution far enough for DSH to inspect the profile.

The current local profile no longer contains that failed plugin set, so those errors belong to the troubleshooting record rather than the machine's present state.

Open Design exposed one more useful boundary. pnpm first blocked a Git dependency's lifecycle script; after build approval, the script actually started and then failed at `tsx: command not found`. The inspected [Open Design source manifest](https://github.com/nexu-io/open-design/blob/main/package.json) targets Node `~24` and declares its source tooling, while the captured machine ran Node `v26.7.0`. Build permission had been repaired, but source-build compatibility had not. The log showed both conditions without proving that either one alone caused every failure.

## The safer repair order names the failing layer

A repeatable troubleshooting sequence came out of the mess:

1. Record the last visible stage, command, and version.
2. Check `jobs -l` after Ctrl+Z; end or resume every suspended process before another package-runner test begins.
3. Use verbose registry output as a clue, never as proof of a specific resolver defect.
4. Test an alternate runner with an exact package version.
5. Verify `command -v dsh`, `dsh --version`, and `dsh --help` before touching the profile.
6. Back up `$DSH_HOME/profiles/<name>`, then handle schema, package, and build failures one entry at a time.

This order keeps a working bootstrap from being thrown away because the next subsystem is broken. It also keeps a plugin error from being retold as “DeepSeek Harness will not install,” which was no longer true once the wrapper returned valid CLI help.

## The working result was small, and deliberately limited

The final setup did not force a global npm installation. A pinned `pnpm dlx` invocation supplied the CLI, a tiny executable made its name discoverable, and the persistent profile stayed in `~/.dsh`. That solved the runner and command-discovery problem on the captured system.

It did not explain the original `npx` wait, repair every third-party plugin, or promise that release-candidate behavior will remain fixed. Those limits make the result more useful, not less: each failure now has a layer and a next check.

Before changing the pinned version or adding another Git-hosted plugin, the next useful step is to inspect DeepSeek's current [run instructions](https://github.com/deepseek-ai/deepseek-harness#run) and [`dsh` CLI behavior reference](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/reference/README.md). The project is moving quickly, and its own record should decide what changes next.

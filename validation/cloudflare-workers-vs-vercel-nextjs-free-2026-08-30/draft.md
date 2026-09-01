# Cloudflare Workers vs Vercel for Free Next.js: The Tradeoff Changed

On 25 August 2026, a [Cloudflare documentation commit](https://github.com/cloudflare/cloudflare-docs/commit/86bc28dddc8c6c64cece0a553e6846eb499dc764) replaced the OpenNext-centered framework guide with **vinext** as the default path for new Workers deployments. OpenNext remains the route for existing applications that cannot migrate. That change captures the whole free-hosting decision: Cloudflare offers extraordinary static-delivery economics and a useful collection of serverless services, but the framework layer asks for more compatibility work. Vercel offers the cleaner first-party Next.js path and much more room for server execution, but its Hobby plan is limited to non-commercial personal use.

Neither platform owns a universal win. A mostly static portfolio with a contact form has a different first constraint from an authenticated dashboard, an image pipeline, or an ad-supported publication. The useful comparison begins with the application shape, then follows each request to the meter that actually charges it.

![A kraft project folder connected by black cords to a paper routing tray and a padded equipment case on a worn workbench.](asset://blog:cloudflare-workers-vs-vercel-nextjs-free:feature-two-paths)

*One Next.js codebase can enter two free tiers that reward very different workloads.*

## The Cloudflare path is now vinext, not OpenNext

Cloudflare describes [vinext](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) as a Vite plugin that reimplements the Next.js API surface. App Router, Pages Router, React Server Components, Server Actions, server-side rendering, static generation, ISR, and middleware appear as supported. The same table marks `next/*` imports as mostly supported and image optimization as partially supported. Cloudflare also labels vinext beta and asks production adopters to run `npx vinext check` before migration.

![Diagram showing Cloudflare's Next.js guidance moving from an OpenNext-centered path to beta vinext for new projects, while retaining OpenNext for existing deployments that cannot migrate.](asset://blog:cloudflare-workers-vs-vercel-nextjs-free:evidence-vinext-default)

*The 25 August guide moves new projects to beta vinext while retaining an OpenNext path for existing applications that cannot migrate.*

That caveat is more substantial than ordinary setup friction. A compatibility layer may accept the same file structure while differing at the edges: a package can assume a Node API, an image path can rely on Vercel behavior, or a framework update can land before the adapter catches up. The [vinext repository](https://github.com/cloudflare/vinext/blob/main/README.md) calls OpenNext more mature and the safer choice where the widest compatibility matters.

OpenNext has not disappeared. Cloudflare still documents its [OpenNext adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/) for existing applications. It consumes `next build` output rather than replacing the build system with Vite. That maturity can be valuable, although Cloudflare no longer presents it as the default starting point for a new project.

Vercel sits on the other side of this trade. It maintains Next.js and provides a [zero-configuration deployment path](https://vercel.com/docs/frameworks/full-stack/nextjs). Next.js also states that platform adapters use public integration surfaces rather than private framework hooks, so third-party deployment is a supported idea. The distinction is not “real Next.js” versus imitation. It is first-party operational integration versus an adapter whose compatibility must be checked.

## The free limits use different units

A single headline request number obscures the comparison. Cloudflare separates static assets from Worker execution. Vercel counts both static assets and functions as CDN Requests, surfaced as Edge Requests in its usage dashboard. Cloudflare resets its dynamic request allowance daily; Vercel's principal Hobby allowances are monthly. Equal monthly traffic can therefore fail differently when it arrives as a steady stream or a one-day launch.

| Boundary | Cloudflare Workers Free | Vercel Hobby |
|---|---|---|
| Traffic | [100,000 Worker requests per day](https://developers.cloudflare.com/workers/platform/limits/#daily-requests) | [1,000,000 Edge Requests per month](https://vercel.com/docs/manage-cdn-usage#cdn-requests) |
| Static assets | [Free and unlimited when no Worker runs](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#billing) | [Static assets and functions both incur CDN Requests](https://vercel.com/docs/manage-cdn-usage#cdn-requests) |
| Active CPU | [10 ms per HTTP request](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) | [4 CPU-hours per month](https://vercel.com/docs/limits#included-usage) |
| Runtime memory | [128 MB per isolate](https://developers.cloudflare.com/workers/platform/limits/#memory) | [2 GB and 1 vCPU per function](https://vercel.com/docs/functions/limitations#memory-size-limits) |
| Server bundle | [3 MB compressed Worker](https://developers.cloudflare.com/workers/platform/limits/#worker-size) | [250 MB standard uncompressed function](https://vercel.com/docs/functions/limitations#bundle-size-limits) |
| Builds | [3,000 minutes/month; 20-minute timeout](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) | [6,000 minutes/month; 45-minute timeout](https://vercel.com/docs/limits#included-usage) |
| Use policy | [Self-Serve and product terms apply](https://www.cloudflare.com/terms/) | [Non-commercial personal use](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage) |

![Two-column comparison of Cloudflare Workers Free and Vercel Hobby across traffic, compute, server bundle, builds, and plan policy.](asset://blog:cloudflare-workers-vs-vercel-nextjs-free:comparison-boundaries)

*The allowances are separate meters, not a combined score. A static-heavy site and a server-heavy application can hit opposite limits first.*

## Cloudflare's strongest advantage sits outside the Worker

[Static Asset requests on Workers](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) are free and unlimited when routing does not invoke the Worker. That makes a statically generated site, documentation property, or cached publication unusually difficult to outgrow on request count alone. The advantage disappears for routes configured to run the Worker first: after the daily Worker allowance is exhausted, Cloudflare can return `429` responses even when the requested asset exists.

Dynamic requests on the Free plan receive [100,000 Worker requests per day](https://developers.cloudflare.com/workers/platform/limits/), resetting at midnight UTC, plus 10 milliseconds of CPU per HTTP request, 128 MB per isolate, and a 3 MB compressed Worker limit. Ten milliseconds sounds like a timeout, but it is active CPU rather than wall-clock duration. Time waiting on `fetch`, KV, or a database does not consume that CPU meter. HTTP request duration has no fixed limit while the client stays connected, although sustained CPU excess can still terminate an invocation.

The small bundle and CPU ceilings shape good candidates. Static routes, redirects, cached responses, and measured thin handlers can fit well. Cloudflare's own limits page says authentication, server-side rendering, and large-payload parsing typically consume 10 to 20 milliseconds, already at or above the Free plan's 10-millisecond CPU allowance. Occasional overruns receive some flexibility, but consistent overruns end the invocation. Large dependency graphs, CPU-heavy transformations, and libraries written around unsupported Node behavior add more risk. The 128 MB figure is per isolate rather than a dedicated allocation to every request, so it should not be read as a miniature function container.

Cloudflare's full-stack appeal extends beyond hosting. The D1 Free tier includes [5 million rows read per day, 100,000 rows written per day, and 5 GB of storage](https://developers.cloudflare.com/workers/platform/pricing/#d1). Poor indexes can burn row-read allowance faster than returned result counts suggest, so even a small application needs query discipline. The [Workers bindings available to vinext](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/#access-cloudflare-bindings) also include KV, R2, Queues, and Durable Objects.

## Vercel buys first-party integration and server headroom

Vercel Hobby's server limits are far more forgiving for ordinary Node-oriented Next.js code. Current Fluid-compute functions have [2 GB of memory, 1 vCPU, a 300-second maximum duration, and a standard 250 MB uncompressed size limit](https://vercel.com/docs/functions/limitations). Hobby also includes [4 hours of active CPU, 360 GB-hours of provisioned memory, and 1 million function invocations](https://vercel.com/docs/functions/usage-and-pricing). Active CPU excludes time spent waiting on network or database responses, just as Workers CPU time does, but memory and request meters continue to accumulate under their own rules.

This headroom reduces migration surprises. Native Node dependencies, heavier rendering paths, larger server bundles, and longer jobs have more space before a platform boundary appears. Vercel also provides 6,000 build minutes per month and a 45-minute build step, compared with Cloudflare Workers Builds at 3,000 minutes and a 20-minute timeout.

The cost is that static delivery is not an unmetered side road. Vercel states that [static assets and functions both incur CDN Requests](https://vercel.com/docs/manage-cdn-usage#cdn-requests), shown as Edge Requests. Hobby includes 1 million such requests and 100 GB of Fast Data Transfer. Browser caching can reduce repeat traffic, but a page with many uncached assets can consume several requests per visit. Vercel also says that, in most cases, an exhausted Hobby allowance makes the feature unavailable until 30 days have passed, with some meters using a shorter period.

## “Free” has a use-policy boundary

[Vercel Hobby is restricted to non-commercial personal use](https://vercel.com/docs/plans/hobby). A private experiment, personal portfolio, or non-monetized hobby project fits the stated plan purpose. Vercel's [commercial-use examples](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage) explicitly include advertisements, payment requests, product or service promotion, paid site work, and affiliate linking as the site's primary purpose. Free infrastructure does not override the plan terms.

[Cloudflare's Workers Free pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/) carry no comparable personal-only condition. Cloudflare's acceptable-use rules and product-specific conditions still apply, so that difference is not blanket permission for every workload. It does make Workers the more natural free-tier candidate for a small commercial experiment that otherwise fits its technical limits.

Neither platform requires a purchased domain for a first deployment. Workers can use a [`workers.dev` address](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), while Vercel supplies a [generated `vercel.app` address](https://vercel.com/docs/deployments/generated-urls). A branded production site can add a separately purchased domain later; the registration cost sits outside either hosting allowance.

## Pros and cons in practical terms

**Cloudflare Workers Free — strengths.** Static assets can bypass request billing entirely; the daily Worker allowance suits steady small traffic; D1 and other bindings support a compact full-stack architecture; and the plan is not labeled personal non-commercial. The non-destructive vinext setup also lets an existing Next.js project keep its ordinary development path while compatibility is tested.

**Cloudflare Workers Free — weaknesses.** vinext is beta, several Next.js surfaces are not fully supported, the 3 MB Worker and 10 ms CPU limits demand discipline, and a daily cap can punish a concentrated launch. OpenNext remains more mature, but it is no longer Cloudflare's new-project default.

**Vercel Hobby — strengths.** The framework's maintainer supplies the deployment integration; function memory, duration, and application size leave much more space; builds receive twice the monthly minutes and more than twice the per-build time; and the deployment workflow asks for very little platform adaptation.

**Vercel Hobby — weaknesses.** Static files consume Edge Requests, the main allowances are expressed monthly rather than daily, exhaustion can make a feature unavailable for roughly 30 days, and the non-commercial rule excludes many projects that otherwise fit the technical tier.

## The workload should choose the platform

1. A static portfolio, documentation site, or cached publication is a strong Workers candidate when vinext passes its compatibility check. Unmetered static delivery can matter more than function headroom.
2. A personal, non-commercial application with heavy SSR, native Node packages, large dependencies, or long server work is a stronger Vercel candidate. First-party integration avoids the extra compatibility layer, and larger limits leave more operating room.
3. A small commercial prototype favors Workers on policy, provided its dynamic paths stay lean and its traffic can tolerate a daily ceiling.
4. An existing OpenNext deployment does not need a fashionable migration. Cloudflare continues to support the adapter, and vinext's own documentation describes OpenNext as the safer broad-compatibility path.
5. A workload close to either ceiling needs measurement. Published limits cannot answer latency, cold-start behavior, cache-hit rates, database placement, or framework correctness for a particular codebase.

## Verdict

Vercel remains the lower-risk free home for a personal Next.js application when avoiding adapter-specific gaps and preserving server headroom dominate. Cloudflare Workers is the sharper choice when the application is static-heavy, benefits from Workers-native services, or falls outside Vercel Hobby's non-commercial boundary.

The deciding test is not a generic request total. It is whether the real routes fit vinext, whether dynamic work fits a 3 MB Worker and 10 ms active-CPU budget, and whether the project's purpose fits Hobby's terms. A credible Workers candidate should pass `npx vinext check` and compare its dynamic paths against the current limits before migration. A credible Vercel candidate should estimate Edge Requests, transfer, and active compute separately rather than treating one million requests as one million complete page views.

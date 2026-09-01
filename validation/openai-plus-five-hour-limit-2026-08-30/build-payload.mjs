import fs from "node:fs";
import path from "node:path";

const packageDir = path.dirname(new URL(import.meta.url).pathname);

const payload = {
  title:
    "OpenAI Brought Back the Five-Hour Plus Limit—Here Is What It Limits",
  slug: "openai-plus-five-hour-limit-explained",
  excerpt:
    "OpenAI restored a five-hour window for Plus across Codex and ChatGPT Work. It meters variable usage inside weekly limits, not five hours of active work.",
  status: "published",
  publishedAt: "2026-08-30T16:36:01+07:00",
  tags: [
    "OpenAI",
    "ChatGPT Plus",
    "Codex",
    "ChatGPT Work",
    "Usage Limits",
  ],
  readTime: "7 min read",
  coverTone: "research",
  sourceHref:
    "https://x.com/thsottiaux/status/2092058556707344708",
  seoTitle: "OpenAI's Five-Hour Plus Limit: What It Actually Limits",
  seoDescription:
    "OpenAI restored a five-hour window for Plus across Codex and ChatGPT Work. It meters variable usage inside weekly limits, not five hours of active work.",
  language: "en-US",
  author: {
    id: "https://me.mukhtada.my.id/#person",
    name: "Mukhtada Billah NST",
    url: "https://me.mukhtada.my.id/",
  },
  articleSection: "AI Investigation",
  featuredImage: {
    assetKey:
      "blog:openai-plus-five-hour-limit-explained:feature-window-weekly-plan",
    alt:
      "An analog timer beside a folded blank weekly paper grid, with a short amber strip marking part of the schedule on a dark worktable.",
    width: 1672,
    height: 941,
  },
  blocks: [
    {
      type: "paragraph",
      text:
        "On July 16, OpenAI's Head of Codex said Plus and Pro had run without a five-hour gate for “a few days” and asked whether the weekly limit alone was easier to manage. On Aug. 24 Pacific time, he announced that the gate would return for Plus the next day. The reversal is real, but the common reading isn't: five hours names an allowance window, not five literal hours of active work.",
    },
    {
      type: "image",
      assetKey:
        "blog:openai-plus-five-hour-limit-explained:feature-window-weekly-plan",
      alt:
        "An analog timer beside a folded blank weekly paper grid, with a short amber strip marking part of the schedule on a dark worktable.",
      width: 1672,
      height: 941,
      text:
        "The short window sits inside a longer allowance. The timer represents pacing, not five literal hours of active compute.",
    },
    {
      type: "heading",
      text: "The return followed a few days without the short window",
    },
    {
      type: "paragraph",
      text:
        "The source was not an anonymous leak. [Thibault “Tibo” Sottiaux](https://forum.openai.com/public/events/codex-is-for-everyone-why-codex-matters-beyond-code-fa40puy7wi) leads Codex at OpenAI. His [July 16 post](https://x.com/thsottiaux/status/2077632589498913087) said the five-hour limit had been absent from Codex Plus and Pro for a few days. It asked whether that made the weekly allowance easier or harder to manage and invited ideas for a better design. The post did not specify the exact removal date or call the period a formal test.",
    },
    {
      type: "paragraph",
      text:
        "The answer arrived less than six weeks later. Sottiaux's [Aug. 24 Pacific-time announcement](https://x.com/thsottiaux/status/2092058556707344708) said the five-hour limit would return “tomorrow” for Plus accounts across ChatGPT Work and Codex. The same post rendered at 8:16 a.m. on Aug. 25 in Jakarta. An independent [9to5Mac report](https://9to5mac.com/2026/08/24/openai-restores-5-hour-codex-and-work-limits-for-chatgpt-plus-users/), published 31 minutes later at 6:47 p.m. Pacific, identified Aug. 25 as the return date.",
    },
    {
      type: "image",
      assetKey:
        "blog:openai-plus-five-hour-limit-explained:evidence-tibo-announcement",
      alt:
        "X post by Tibo at @thsottiaux, dated 25 August 2026 in Jakarta, announcing a five-hour limit for Plus across ChatGPT Work and Codex and giving OpenAI's rationale.",
      width: 625,
      height: 535,
      text:
        "Sottiaux's post establishes the decision and its stated reasons. It does not define the size of the allowance inside the five-hour window.",
    },
    {
      type: "paragraph",
      text:
        "By the Aug. 30 cutoff, OpenAI's live [ChatGPT Work and Codex pricing page](https://learn.chatgpt.com/docs/pricing) described local messages in a five-hour window and said local messages and cloud chats share that window on ChatGPT plans. Additional weekly limits may also apply. The announcement and the current documentation therefore agree on the central point: Plus once again has a short window layered over a longer allowance.",
    },
    {
      type: "heading",
      text: "Five hours is the allowance frame, not the amount of work",
    },
    {
      type: "paragraph",
      text:
        "The phrase sounds like a kitchen timer attached to an account. OpenAI's own units show a different system. Its pricing page estimates *messages per five-hour window*, and those estimates change sharply with the selected model.",
    },
    {
      type: "table",
      text: "OpenAI's Plus estimates for local messages per five-hour window",
      rows: [
        ["Local model", "Plus estimate", "What the range says"],
        [
          "GPT-5.6 Sol",
          "10–100 messages",
          "Difficult, context-heavy work can consume the allowance quickly.",
        ],
        [
          "GPT-5.6 Terra",
          "25–200 messages",
          "Everyday production work spans a broad range.",
        ],
        [
          "GPT-5.6 Luna",
          "250–2,000 messages",
          "Lighter tasks can fit far more turns into the same window.",
        ],
      ],
    },
    {
      type: "paragraph",
      text:
        "Those figures are estimates, not entitlements. OpenAI says consumption changes with task size, local or cloud execution, context length, reasoning, tools, retrieval, and caching. A short prompt can still launch expensive work, while a focused local task may use only a fraction of the allowance. Prompt count and wall-clock time are both poor substitutes for the account meter.",
    },
    {
      type: "paragraph",
      text:
        "The shared pool makes the label even less literal. A cloud chat may consume more allowance than a local message, and activity in ChatGPT Work can compete with Codex activity inside the same window. Other agentic features can also share usage when OpenAI applies their pricing. The five-hour window is an accounting frame for short-horizon allowance; it does not promise five hours of uninterrupted agent runtime. OpenAI does not publish the exact account-level reset algorithm.",
    },
    {
      type: "heading",
      text: "OpenAI's case for the limit has two parts",
    },
    {
      type: "paragraph",
      text:
        "Sottiaux gave two reasons for restoring the shorter window. First, he said it helps smooth demand on OpenAI's compute, which in turn helps the company keep the weekly plan generous. Second, he said Plus includes relatively casual and new users who can accidentally consume a full week's usage and then find the result confusing.",
    },
    {
      type: "paragraph",
      text:
        "Both reasons describe plausible product-design problems. A weekly-only budget lets work arrive in a large spike, which is harder for a shared service to schedule. A shorter window can spread demand and act as a guardrail for a subscriber who does not yet understand how quickly a large repository, long context, strong model, or tool-heavy run can drain the weekly pool.",
    },
    {
      type: "paragraph",
      text:
        "The public post supplied no capacity chart, incident record, or user-study method. Load smoothing and accidental exhaustion are therefore OpenAI's stated rationale, not independently measured benefits in the public record. The same control that protects one subscriber from a bad Tuesday can block another subscriber who deliberately reserved Tuesday for a large project.",
    },
    {
      type: "heading",
      text: "The cost falls hardest on bursty work",
    },
    {
      type: "paragraph",
      text:
        "The July post asked whether weekly-only management was easier or harder and invited alternative designs. After the return announcement, one [OpenAI Developer Community member](https://community.openai.com/t/bring-back-the-5h-limit-for-plus-accounts-across-chatgpt-work-and-codex/1392372) said the absence of the short window had enabled more work, rejected the assumption that every Plus subscriber was casual, and asked OpenAI to consider a daily limit instead.",
    },
    {
      type: "paragraph",
      text:
        "That objection is stronger than a generic demand for unlimited compute. A weekly allowance and a five-hour allowance solve different problems. The weekly layer controls total consumption over several days. The short layer controls when that consumption may happen. A subscriber can accept the first constraint and still dislike the second because an irregular schedule rewards flexibility more than steady pacing.",
    },
    {
      type: "paragraph",
      text:
        "The shorter window also adds planning uncertainty. The official Sol estimate spans a tenfold range, while the Luna estimate spans eightfold. A session can cross the boundary after a handful of expensive turns or survive hundreds of light ones. That variability makes a fixed reset interval easier for OpenAI to operate than for a subscriber to predict.",
    },
    {
      type: "heading",
      text: "Official completion language and user reports do not line up cleanly",
    },
    {
      type: "paragraph",
      text:
        "OpenAI's current [pricing page](https://learn.chatgpt.com/docs/pricing) says that when a usage limit is reached during an active turn, the agent can continue working on that turn, subject to fair-use limits.",
    },
    {
      type: "paragraph",
      text:
        "Some post-change reports describe something rougher. In the OpenAI Developer Community limits thread, one [Plus user reported](https://community.openai.com/t/codex-rate-limits-discussion-thread/1378553/558) that a final prompt often failed, work was interrupted, and the task had to be prompted again after reset.",
    },
    {
      type: "paragraph",
      text:
        "That post is a firsthand report, not a controlled reproduction. It cannot establish how often interruption occurs, whether the short window caused each failure, or whether every Codex surface behaved the same way. The official promise cannot erase the report either. The honest conclusion is narrower: OpenAI documents active-turn continuation, while at least one user reports behavior that appears inconsistent with it. Account logs and a reproducible test would be needed to resolve the gap.",
    },
    {
      type: "heading",
      text: "The Pro exception is clear in the post and murky in the pricing table",
    },
    {
      type: "paragraph",
      text:
        "Sottiaux's announcement said the five-hour limit would remain disabled for the $100 and $200 Pro subscriptions for the upcoming months. That made the Plus change an explicit tier boundary, not a universal return.",
    },
    {
      type: "paragraph",
      text:
        "OpenAI's current pricing page complicates the wording. Its table expresses Pro 5x and Pro 20x capacity as estimated messages per five-hour window alongside Plus. The page does not explain how those estimates relate to the announced enforcement exception. It may describe an accounting frame without enforcing the same short stop, or the documentation may be using one table for several behaviors. The checked record does not settle which interpretation is correct.",
    },
    {
      type: "paragraph",
      text:
        "That ambiguity is a good reason to avoid two common claims: neither “Pro has no five-hour accounting” nor “Pro now has the same five-hour gate” follows cleanly from the available pages. The article's confirmed scope remains Plus.",
    },
    {
      type: "heading",
      text: "What the return means for a Plus subscriber",
    },
    {
      type: "list",
      text:
        "Plus usage for Codex and ChatGPT Work is governed by a five-hour allowance window, with a separate weekly limit that may also apply.\nThe window is shared across local messages and cloud chats; it is not five hours of active work.\nModel choice and task shape can move consumption by a wide margin, so a universal message count does not exist in the public documentation.\nOpenAI presents the window as compute pacing and protection against accidental weekly exhaustion.\nThe same pacing can punish intentionally bursty work, and current community reports raise an unresolved question about whether active turns always receive the continuation OpenAI documents.",
    },
    {
      type: "paragraph",
      text:
        "The next useful check is OpenAI's [current pricing page](https://learn.chatgpt.com/docs/pricing), followed by the account usage dashboard or `/status` inside Codex. Future announcements should be compared with both surfaces. A post can say that “five hours” returned; only the live meter shows how much work that phrase buys for a particular account and task.",
    },
  ],
};

fs.writeFileSync(
  path.join(packageDir, "payload.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);

console.log(
  JSON.stringify({
    slug: payload.slug,
    status: payload.status,
    blocks: payload.blocks.length,
    images: payload.blocks.filter((block) => block.type === "image").length,
  }),
);

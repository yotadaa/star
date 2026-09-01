# LinkedIn post template

Most “free portfolio” tutorials stop at deployment. The awkward part begins when the portfolio needs editable articles, durable uploads, and a publishing workflow that can be retried safely.

I audited the stack behind my own portfolio: Next.js, Vercel Hobby, Convex Free, and Cloudflare R2.

The surprising part was not the size of the free limits. It was that each provider means something different by “free”:

- Vercel Hobby is $0, but it is restricted to non-commercial personal use.
- Convex Free uses hard resource caps.
- R2 can stay at $0 inside its monthly allocation, but activation still requires checkout and a payment method.
- Public R2 media should use a custom domain. If one is not already available, buying an inexpensive domain is enough, but registration and renewal sit outside the free infrastructure stack.

The stack makes sense when content changes without a redeploy and media needs a durable home. For a static portfolio, it may be unnecessary machinery.

I wrote a practical breakdown of the architecture, current limits, billing caveats, SEO structure, pros, cons, and the points where a simpler setup wins.

Read it here: https://me.mukhtada.my.id/blog/free-portfolio-stack-nextjs-convex-r2-vercel

Would a portfolio keep its media with the application data, or split it into object storage?

#NextJS #Convex #CloudflareR2 #Vercel #WebDevelopment #Portfolio

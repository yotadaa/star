# Google Analytics 4 source

The supplied Google tag is installed globally through
`components/GoogleAnalytics.jsx`. Its deployment-specific measurement ID is no
longer stored in this tracked file.

Configure it locally in ignored `.env.local` and in the Vercel project
environment:

```dotenv
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

The value is a public browser identifier, not a server secret, but env keeps the
property-specific configuration out of source and prevents accidental reuse in
another deployment.

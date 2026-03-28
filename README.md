# Systems and Strides

My personal website built with **Next.js App Router**, featuring a blog with real-time filtering, dark/light theme support, and markdown-powered content.

## 🚀 Features

- **Dynamic Intro**: Homepage introduction managed via `content/intro.md`
- **About Page**: Dedicated about page rendered from `content/about.md`
- **Blog System**: Tag-filterable blog with client-side search and filtering
- **Theme Toggle**: Dark/light mode with persistent theme preference
- **Responsive Design**: Mobile-first design with CSS modules
- **Performance Optimized**: 
  - Markdown content caching
  - Reusable remark processor
  - CSS optimization
  - Console removal in production
  - Static export for fast delivery

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Static Export)
- **Styling**: CSS Modules with CSS Variables
- **Font**: Inter (Google Fonts)
- **Markdown Processing**: 
  - `gray-matter` - YAML frontmatter parsing
  - `remark` - Markdown to HTML conversion
  - `remark-html` - HTML output plugin
- **State Management**: React Context API (theme)

## � Project Structure

```
shsin.github.io/
├── content/              # Markdown content
│   ├── intro.md         # Homepage intro
│   ├── about.md         # About page content
│   └── posts/           # Blog posts
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.js    # Root layout with theme provider
│   │   ├── page.js      # Homepage
│   │   ├── about/       # About page route
│   │   ├── posts/       # Dynamic blog post routes
│   │   └── not-found.js # 404 page
│   ├── components/      # React components
│   │   ├── BlogList.js  # Blog listing with search/filter
│   │   ├── Footer.js    # Site footer
│   │   ├── Intro.js     # Intro section
│   │   └── ThemeToggle.js # Dark/light mode toggle
│   ├── contexts/        # React contexts
│   │   └── ThemeContext.js # Theme state management
│   └── lib/             # Utilities
│       └── markdown.js  # Markdown processing with caching
└── public/              # Static assets
```

## 📝 Adding Content

### Create a Blog Post

Add a new `.md` file in `content/posts/`:

```markdown
---
title: "Your Post Title"
date: "2024-01-21"
tags: ["javascript", "react"]
---

Your content here...
```

### Draft Posts

Mark a post as a draft to hide it from production builds while still being visible during development:

```markdown
---
title: "Work in Progress"
date: "2024-01-21"
tags: ["drafts"]
draft: true
---
```

- **`npm run dev`** — Draft posts are visible
- **`npm run build`** — Draft posts are excluded

Remove `draft: true` when ready to publish.

### Embed a YouTube Video

Use the `@[youtube](VIDEO_ID)` syntax in any post. Optionally override width and aspect ratio:

```markdown
@[youtube](dQw4w9WgXcQ)

@[youtube](dQw4w9WgXcQ){width: 60%, aspect-ratio: 9/16}
```

The `VIDEO_ID` is the `v=` parameter from the YouTube URL.

### Embed a Strava Activity

Use the `@[strava](ACTIVITY_ID/EMBED_TOKEN)` syntax:

```markdown
@[strava](1234567890/abc123embedtoken)
```

To get the embed token: open the activity on Strava → Share → Embed → copy the `src` from the iframe snippet. The token is the last path segment after `/embed/`.

### Embed an X (Twitter) Post

Use the `@[tweet](TWEET_ID)` syntax:

```markdown
@[tweet](1234567890123456789)
```

The tweet ID is the number at the end of the post URL — e.g. `https://x.com/user/status/1234567890123456789`.

### Update Intro or About

Edit `content/intro.md` or `content/about.md`:

```markdown
---
title: "Welcome"
---

Your markdown content here...
```

## 📤 Cross-Posting

A local CLI to sync published posts to **Medium** and **Substack** — no API keys needed.

- **Medium**: Opens "Import a Story" in your browser, auto-importing the post content with a canonical URL back to your site.
- **Substack**: Copies the post HTML to your clipboard and opens the Substack editor for pasting.

Tracking state is stored in `crossposted.json` to prevent duplicates. Posts can opt out with `crosspost: false` in frontmatter.

```bash
npm run crosspost                          # Cross-post changed posts to both platforms
npm run crosspost -- --all                 # Cross-post all published posts
npm run crosspost -- rest-days             # Cross-post a specific post by slug
npm run crosspost -- --medium rest-days    # Import a specific post to Medium only
npm run crosspost -- --dry-run --all       # Preview all posts without acting
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

## 📦 Deployment

This site is configured for static export and is automatically deployed to **GitHub Pages** via GitHub Actions. Every push to the main branch triggers a new deployment.

### Build Configuration

- **Output**: Static HTML export (`output: 'export'`)
- **Images**: Unoptimized (GitHub Pages compatible)
- **Performance**: CSS optimization, console removal, compression enabled

## 🎨 Customization

- **Theme Colors**: Edit CSS variables in `src/app/globals.css`
- **Site Metadata**: Update in `src/app/layout.js`
- **Styling**: Modify component-specific CSS modules

## 📄 License

Personal website content and design.

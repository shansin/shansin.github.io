# Shantanu's Corner

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

### Update Intro or About

Edit `content/intro.md` or `content/about.md`:

```markdown
---
title: "Welcome"
---

Your markdown content here...
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

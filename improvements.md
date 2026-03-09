# Blog Improvements Plan

Goal: Elevate **Systems and Strides** from a clean personal blog to a polished, professional presence that signals deep expertise and thoughtful craft.

---

## 1. Stronger Homepage Identity

**Problem:** The current intro ("I document and share my learnings here. Some of them may be useful to you!") is generic and undersells the author.

**Proposed intro:**

> I'm Shantanu — a senior engineering manager at a large tech company, endlessly curious about how things work and how they break. I write about building AI systems on local hardware, leading engineering teams, and the surprising parallels between endurance sports and software. This is where I think out loud.

**Changes:**
- Replace the current `content/intro.md` body with a sharper personal statement
- Keep the title "Systems and Strides" with its current gradient treatment
- Add a one-line tagline beneath the title: *"Engineering depth. Endurance mindset."*

---

## 2. About Page — Compelling but Not Overloaded

**Problem:** Current About page is a few bullet points. It should convey credibility without reading like a resume.

**Proposed structure:**
- 2-3 paragraph narrative (who you are, what drives you, what this blog is about)
- Keep the existing social links (GitHub, Strava, LinkedIn)
- No credentials list or job history — let the writing speak

---

## 3. Reading Progress Bar

**What:** A thin accent-colored bar at the very top of the viewport that fills as you scroll through a blog post.

**Implementation:**
- New `ReadingProgress` component, rendered only on post pages
- Listens to `scroll` events (throttled via `requestAnimationFrame`)
- Fixed position, top: 0, height: 3px, `--accent` color
- Zero impact on layout; purely visual polish

---

## 4. Popular / Featured Posts Section on Homepage

**Two-tier approach:**

### Tier 1: Manual curation (implement first)
- Add `featured: true` to frontmatter of 2-3 best posts
- Homepage renders a "Featured" section above the full post list
- Visually distinct: slightly larger cards, no search/filter chrome

### Tier 2: GA-powered "Most Read" (implement later, optional)
- Build-time script using Google Analytics Data API (GA4)
- Fetches top 5 pages by pageviews over last 90 days
- Writes results to a JSON file consumed at build time
- Requires a GA service account + secret in GitHub Actions
- Falls back to featured posts if API call fails

**Recommendation:** Start with Tier 1. It's zero-dependency and gives you editorial control. Add Tier 2 when you have enough traffic to make it meaningful.

---

## 5. Subscribe Section (RSS + Newsletter)

**Problem:** The blog has an RSS feed (`/feed.xml`) but it's not discoverable. No way for readers to stay connected.

**Proposed "Stay in the loop" section at the bottom of the homepage (above footer):**

```
┌─────────────────────────────────────────────────┐
│  Stay in the loop                               │
│                                                 │
│  [Email icon] Newsletter    [RSS icon] RSS Feed │
│  ┌───────────────────────────┐                  │
│  │ your@email.com            │  [Subscribe]     │
│  └───────────────────────────┘                  │
│                                                 │
│  No spam. Occasional posts about AI,            │
│  engineering leadership, and endurance sports.  │
└─────────────────────────────────────────────────┘
```

**Newsletter provider: Buttondown**
- Free tier (up to 100 subscribers)
- Markdown-native, indie, privacy-respecting
- Integration is a simple HTML form POST — no JavaScript SDK needed
- Works perfectly with static sites
- Sign up at buttondown.com, get your form action URL
- Embed a `<form>` that POSTs to `https://buttondown.com/api/emails/embed-subscribe/<your-username>`

**RSS:**
- Add a visible RSS link in the subscribe section and in the footer
- Add `<link rel="alternate" type="application/rss+xml">` to the `<head>` (may already exist)

---

## 6. Subtle Navigation Bar

**Problem:** No persistent navigation means visitors on inner pages have no quick way to get home or discover other sections.

**Proposed minimal nav:**

```
┌─────────────────────────────────────────────────┐
│  Systems and Strides          About  Subscribe  │
└─────────────────────────────────────────────────┘
```

- Fixed/sticky at top, blurs into background (`backdrop-filter: blur`)
- Site title (links home) on the left, 2-3 links on the right
- Appears on all pages *except* the homepage (where the Intro component already serves this purpose) — OR appears on all pages but is more subdued on the homepage
- The theme toggle moves from footer to nav bar (more discoverable)
- Slim: ~48px height, doesn't dominate

---

## 7. Typography & Spacing Refinements

The current typography is solid. Minor refinements for a more polished feel:

- **Post body line-height:** Increase from `1.8` to `1.85` for slightly more breathing room
- **Heading letter-spacing:** Add `-0.01em` to h2/h3 in post content for tighter, more editorial feel
- **Block quotes:** Currently unstyled. Add a left border accent + slight indent + italic for visual distinction
- **Horizontal rules in posts:** Style as a centered `· · ·` (three dots) instead of a plain line — common in essay-style blogs
- **Code blocks:** Add a subtle top-bar with the language label (e.g., "javascript", "bash") extracted from the code fence

---

## 8. Visual Polish Pass

Small details that compound into a premium feel:

- **Smooth page transitions:** Fade-in on route changes using CSS (`@starting-style` or a simple animation on main content)
- **Image treatment in posts:** Subtle rounded corners + shadow on images within post content
- **Post header:** Add a faint decorative line or accent element between the title and the metadata (date/reading time)
- **Card hover states:** Current `translateY(-2px)` is good. Add a very subtle box-shadow on hover for depth
- **Footer:** Currently has copyright + social links. Add the RSS icon here too
- **Selection color:** Set `::selection` background to a tinted accent color for brand consistency

---

## 9. OG / Social Preview Images (Nice to Have)

**Problem:** Shared links on Twitter/LinkedIn show no preview image unless the post has a `coverImage`.

**Approach:** Auto-generate OG images at build time using `@vercel/og` or a custom canvas script.

**Design:**
```
┌─────────────────────────────────────┐
│                                     │
│  Post Title Here                    │
│                                     │
│  Systems and Strides · shsin.blog   │
│  ─────────────────────              │
│  Mar 7, 2026 · 8 min read          │
│                                     │
└─────────────────────────────────────┘
```

- Consistent brand treatment across all shares
- Uses the blog's color scheme and Inter font
- Falls back to a generic site-level OG image for non-post pages

**Note:** `@vercel/og` uses Satori which requires Node.js runtime. For static export, we'd use a build-time script with `canvas` or `sharp` to generate PNGs into `public/og/`.

---

## 10. Micro-interactions & Accessibility

- **Focus indicators:** Ensure all interactive elements have visible, styled focus rings (not browser defaults)
- **Scroll-to-top button:** Appears after scrolling down on long posts, smooth scrolls back up
- **External link indicators:** Subtle arrow/icon on links that leave the site
- **Print stylesheet:** For readers who want to save posts as PDF — hide nav, footer, share buttons

---

## Priority Order

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Homepage intro rewrite | Small | High |
| 2 | Navigation bar | Medium | High |
| 3 | Reading progress bar | Small | Medium |
| 4 | Subscribe section (RSS + Buttondown) | Medium | High |
| 5 | About page rewrite | Small | Medium |
| 6 | Typography & spacing refinements | Small | Medium |
| 7 | Visual polish pass | Medium | Medium |
| 8 | Featured posts section | Medium | Medium |
| 9 | OG images | Medium | Low-Med |
| 10 | Micro-interactions | Small | Low |

---

## What This Does NOT Change

- **Tech stack** — no TypeScript migration, no UI library, no CMS
- **Hosting** — stays on GitHub Pages with static export
- **Content structure** — single stream with tags, no categories
- **Color scheme** — the warm off-white + blue accent is working well
- **Font choice** — Inter is excellent for this use case

---

## Implementation Status

| # | Item | Status |
|---|------|--------|
| 1 | Homepage intro rewrite | Done |
| 2 | Navigation bar | Done |
| 3 | Reading progress bar | Done |
| 4 | Subscribe section (RSS + Buttondown) | Done (needs Buttondown account) |
| 5 | About page rewrite | Done |
| 6 | Typography & spacing refinements | Done |
| 7 | Visual polish pass | Done |
| 8 | Featured posts section | Done |
| 9 | OG images | Not started |
| 10 | Micro-interactions | Not started |

---

## Manual Actions Required

### 1. Set up Buttondown newsletter (required for Subscribe to work)

1. Go to [buttondown.com](https://buttondown.com) and create a free account
2. Set your username to `systemsandstrides` (this must match the form action URL in `src/components/Subscribe.js`)
3. If you choose a different username, update the fetch URL in `Subscribe.js` to match
4. Configure your Buttondown settings:
   - Set the newsletter name to "Systems and Strides"
   - Add a welcome email for new subscribers
   - Optionally connect your custom domain for branded emails

### 2. Curate featured posts over time

- Add `featured: true` to frontmatter of your best 2-3 posts
- Currently featured: **Claude Lens** and **WhatsApp Leo**
- Update these as you publish new content — keep it to 2-3 at most

### 3. Future: GA-powered "Most Read" (optional, when traffic grows)

1. Create a Google Cloud service account with GA Data API access
2. Add the service account JSON key as a GitHub Actions secret (`GA_SERVICE_ACCOUNT`)
3. Build a script in `scripts/fetch-popular-posts.js` that:
   - Calls the GA4 Data API for top pages by pageviews (last 90 days)
   - Writes results to `src/data/popular-posts.json`
4. Add the script as a pre-build step in the deploy workflow
5. Update `BlogList` to consume the JSON and render a "Most Read" section

### 4. Future: OG social preview images (optional)

1. Install `canvas` or `@napi-rs/canvas` as a dev dependency
2. Write a build-time script (`scripts/generate-og-images.js`) that:
   - Reads all published posts
   - Renders a branded 1200x630 PNG per post (title, date, site name)
   - Outputs to `public/og/<slug>.png`
3. Add it as a pre-build step in the deploy workflow
4. Update `generateMetadata` in `src/app/posts/[slug]/page.js` to reference the generated OG image

### 5. Future: Micro-interactions (optional)

- Scroll-to-top button on post pages
- External link indicators (CSS `::after` with a small arrow icon on `a[target="_blank"]`)
- Print stylesheet (`@media print` hiding nav, footer, share buttons)
- Styled focus rings on all interactive elements

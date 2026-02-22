

# Launch Readiness Checklist

A thorough audit of the entire codebase, from branding to security, to get RO Tracker ready for public release and advertising at ROnavigator.com.

---

## 1. Branding and SEO (index.html)

The HTML meta tags still reference Lovable's default OG image and Twitter handle, which will look unprofessional when links are shared.

**Changes to `index.html`:**
- Update `<title>` from "RO Tracker" to "RO Navigator - Track Your Hours. Get Paid Right."
- Update `og:title` and `og:description` to match your brand
- Replace `og:image` and `twitter:image` URLs from the Lovable placeholder to your own branded image (we can generate one or you can provide it)
- Change `twitter:site` from `@Lovable` to your own handle (or remove it)
- Update `<meta name="description">` to something more marketing-oriented, e.g. "Track your automotive repair orders, hours, and pay summaries. Free for techs."

---

## 2. Remove Dev Debug Panel from Production Build

The `DevDebugPanel` component is rendered in `App.tsx` on every page load. While it has a `PROD` guard that hides the UI, it still mounts in production, registers event listeners, and ships the code to users.

**Changes:**
- Remove `<DevDebugPanel />` from `App.tsx` entirely (or wrap in a lazy dev-only import)
- This saves bundle size and removes any chance of the debug button flashing

---

## 3. "Export All Data" Button is a No-Op

In Settings under "Data", the "Export All Data" row has `onClick={() => {}}` -- it does nothing. Users tapping it will think the app is broken.

**Fix options (pick one):**
- **Implement it:** Export all ROs as a JSON or CSV file download (similar to the existing CSV export in Summary)
- **Remove it:** Delete the row if you don't want this feature at launch

Recommended: Implement a simple full-data JSON export so users feel confident their data is portable.

---

## 4. Version Number Row is a Dead Button

The "Version" row in Settings also has `onClick={() => {}}`. Tapping it navigates nowhere and shows a chevron arrow suggesting it should do something.

**Fix:** Remove the `onClick` and chevron arrow -- make it a static display row (no hover/tap styling).

---

## 5. OG/Social Preview Image

Your social share image currently points to `https://lovable.dev/opengraph-image-p98pqg.png` -- a generic Lovable image. When you advertise ROnavigator.com on social media or in messages, this is what previews will show.

**Fix:** Create a branded OG image (1200x630px) with your app name, tagline, and a screenshot of the app. Upload it to `public/og-image.png` and update the meta tags in `index.html`.

---

## 6. App Naming Consistency

The app is deployed at ROnavigator.com but all internal references say "RO Tracker":
- Auth page branding says "RO Tracker"
- Auth page footer says "RO Tracker v1.0"
- HTML title says "RO Tracker"
- Settings About section says version "1.0.0"

**Fix:** Decide on one name and update all references. If the brand is "RO Navigator", update:
- `Auth.tsx` -- title, footer
- `index.html` -- title, description, OG tags
- `SettingsTab.tsx` -- version row value

---

## 7. Security: Enable Leaked Password Protection

The database linter flagged that leaked password protection is disabled. This is a simple toggle that prevents users from signing up with passwords known to be compromised.

**Fix:** Enable this in the authentication settings via the backend configuration.

---

## 8. Error Handling Polish

- `startCheckout` and `openPortal` in `SubscriptionContext.tsx` silently `console.error` on failure without notifying the user. If Stripe checkout fails, the user sees nothing.

**Fix:** Add `toast.error('Could not open checkout. Please try again.')` in the catch blocks.

---

## 9. Missing `DialogDescription` Import

The `SettingsTab.tsx` uses `DialogDescription` in the clear-all dialog but the import is not visible in the provided code. Need to verify it's imported (it appears to be based on the JSX usage -- just needs confirmation).

---

## 10. robots.txt Update

The `robots.txt` allows all crawlers but doesn't include a sitemap reference.

**Fix:** Add `Sitemap: https://ronavigator.com/sitemap.xml` (optional, but helps SEO). Also can simplify to just:
```
User-agent: *
Allow: /
```

---

## Files to Change

| File | Changes |
|------|---------|
| `index.html` | Update title, description, OG tags, Twitter tags, remove Lovable references |
| `src/App.tsx` | Remove `DevDebugPanel` component and import |
| `src/pages/Auth.tsx` | Update branding to match chosen app name |
| `src/components/tabs/SettingsTab.tsx` | Implement "Export All Data", fix Version row, update app name |
| `src/contexts/SubscriptionContext.tsx` | Add toast error messages for checkout/portal failures |
| `public/robots.txt` | Simplify and optionally add sitemap reference |

---

## Summary of Priority

| Priority | Item | Impact |
|----------|------|--------|
| Critical | Fix OG image and social meta tags | Shared links look unprofessional |
| Critical | Remove DevDebugPanel from prod | Ships dev code to users |
| Critical | Fix "Export All Data" no-op | Broken UX, users will report as bug |
| High | App naming consistency (RO Tracker vs RO Navigator) | Brand confusion |
| High | Add error toasts for checkout failures | Silent failures lose customers |
| Medium | Fix Version row dead button | Minor UX annoyance |
| Medium | Enable leaked password protection | Security best practice |
| Low | robots.txt cleanup | Minor SEO improvement |


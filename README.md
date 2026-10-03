# Talal Nasir — Portfolio

A responsive, single-page portfolio for [Talal Nasir](https://github.com/TalalNasir1), designed for GitHub Pages and the custom domain `talalnasir.me`.

## Publish with GitHub Pages

1. Create a repository named `talalnasir.me`.
2. Push every file in this folder to the repository's default branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/ (root)`, then save.
4. Keep `talalnasir.me` in the custom-domain field and enable **Enforce HTTPS** after DNS validation finishes.

The included `CNAME` file preserves the custom domain during deployments.

## Portfolio admin

Projects and certifications live in `content/portfolio.json`, so the public site updates without editing the page layout. A visual editor is included at `/admin/`.

To activate the editor after publishing:

1. Create a free Decap Turbo account and connect the `TalalNasir1/talalnasir.me` GitHub repository.
2. Create one site in Turbo, using `admin/config.yml` as its config path and `https://talalnasir.me/admin/` as the admin interface URL.
3. Replace `REPLACE_WITH_DECAP_TURBO_SITE_ID` in `admin/config.yml` with the Site ID from Turbo.

After that, sign in at `https://talalnasir.me/admin/`. Saving a project or certification creates a GitHub commit, and GitHub Pages publishes the change automatically. Only people granted access to the connected repository/site can edit.

## Local preview

Run a local static server from this folder, then open the printed address in a browser.

```sh
python3 -m http.server 4173
```

## Content sources

- Public GitHub profile and repositories: <https://github.com/TalalNasir1>
- Public LinkedIn profile: <https://www.linkedin.com/in/talalnasir1/>

The custom hero artwork was generated specifically for this portfolio.

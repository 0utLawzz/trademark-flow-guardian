# Git Workflow Guide for Trademark Flow Guardian

This guide outlines the recommended Git usage for the **trademark‑flow‑guardian** project. Following these conventions helps keep the repository clean, makes collaboration easier, and ensures that every commit is automatically pushed to GitHub.

---
## Branching Model

- **`main`** – Production‑ready code.  Never commit directly to `main`.
- **Feature branches** – Create a new branch for each feature or bug‑fix:
  ```bash
  git checkout -b feature/<short‑description>
  ```
- **Short‑lived branches** – Keep branches short‑lived and merge via Pull Requests.

---
## Commit Message Convention

Use the **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type** – `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **scope** – optional component name (e.g., `ui`, `api`)
- **subject** – short description (≤50 characters)
- **body** – optional, more detailed explanation.
- **footer** – optional, e.g., `BREAKING CHANGE:`

Example:
```
feat(ui): add dark‑mode toggle
```

---
## Automatic Push Rule

A **post‑commit hook** is installed in the repository. After each successful `git commit`, the hook runs `git push` automatically, sending the commit to GitHub without any extra steps.

> **Note:** If you prefer to push manually, you can disable the hook by renaming or deleting `.git/hooks/post-commit`.

---
## Pull Request Process

1. Push your feature branch (the hook does this automatically after each commit).
2. Open a Pull Request on GitHub targeting `main`.
3. Ensure CI passes and reviewers approve.
4. Merge using **Squash and merge** to keep a linear history.

---
## Frequently Used Commands

| Action | Command |
|--------|---------|
| Pull latest `main` | `git checkout main && git pull origin main` |
| Create a feature branch | `git checkout -b feature/my‑feature` |
| Commit changes | `git add . && git commit -m "feat: your message"` |
| Push current branch | *(handled automatically by post‑commit hook)* |
| Rebase onto `main` | `git fetch origin && git rebase origin/main` |
| Abort a rebase | `git rebase --abort` |

---
## FAQ

**Q:** *What if the push fails (e.g., network issue)?*  
**A:** The post‑commit hook will surface the error in the console. Fix the issue and run `git push` manually.

**Q:** *Can I skip the automatic push for a specific commit?*  
**A:** Yes – add `--no-verify` to the commit command:
```
git commit -m "msg" --no-verify
```
This bypasses the hook for that commit.

---
## References
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

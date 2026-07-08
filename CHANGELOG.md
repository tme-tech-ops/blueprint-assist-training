# Release v1.0.1

- v1.0.1 - README link and heading updates
- docs: update PAT setup requirements - both repos, org owner required for delete
- fix: use PRIVATE_REPO_TOKEN for GraphQL delete (already exists in public repo)
- fix: use PUBLIC_REPO_TOKEN for GraphQL deleteIssue (requires org owner rights)
- feat: attempt GraphQL deleteIssue after close+lock to fully remove from public
- fix: point training section links to content.md so GitHub Pages resolves them correctly
- more README rendering fixes
- docs: clarify public issue is removed from view after sync (closed + locked)
- Update to main readme
- chore: exclude 3.resources/helper-python/ from public promotion snapshot
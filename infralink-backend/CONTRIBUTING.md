# Contributing to InfraLink Backend

Thank you for considering contributing to InfraLink! Please follow these guidelines.

## Branching Strategy

- `main` — production-ready code
- `develop` — active development base
- Feature branches: `feature/<description>`
- Bug fix branches: `fix/<description>`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add worker profile update endpoint
fix: resolve JWT expiry edge case
chore: update dependencies
docs: add API overview
```

## Pull Requests

1. Branch off `develop`
2. Write/update tests for your changes
3. Ensure `npm test` passes
4. Open PR with a clear description
5. Request at least one review

## Code Style

- Use ES6+ syntax
- Use `async/await` over callbacks
- Follow existing module patterns (controller → service → model)
- Keep controllers thin; put business logic in services

## Module Structure

Each module under `src/modules/` should have:
- `*.controller.js` — HTTP layer only
- `*.service.js` — business logic
- `*.routes.js` — Express router
- `*.validation.js` — Joi schemas
- `*.model.js` — Mongoose model (if applicable)

## Environment

Copy `.env.example` to `.env` and fill in all values before running locally.

## Questions?

Open a GitHub issue or reach out in the team Slack channel.

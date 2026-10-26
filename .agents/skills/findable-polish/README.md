# findable-polish

**Audit discoverability gaps, then generate polished alternatives.**

When your repo, skill page, or landing page isn't being found in search, findable-polish diagnoses why and writes better copy. It runs Findable to audit discoverability issues (missing keywords, weak descriptions, poor structure), then passes the findings to Wordsmith to generate polished alternatives that fix them. You get both the diagnosis and the cure in one pass.

## Usage

```text
/findable-polish [paste content]
/findable-polish path/to/file.md
Audit this README for findability.
```

## When to use

- Your repo isn't showing up in GitHub search
- A skill page has low traffic and you want better copy
- Someone asks "why isn't this being found?"
- You want to improve SEO for a landing page or article
- You need both an audit and concrete rewrite suggestions

## What it produces

- A Findable audit report naming discoverability gaps
- Polished alternatives from Wordsmith for titles, descriptions, headings
- Concrete before/after comparisons
- Guidance on which changes matter most

## Install

```bash
npx skills add arm-pz/findable-polish
```

## Not for

- Tuning SKILL.md trigger language → use [tune-skill](https://github.com/arm-pz/tune-skill)
- Code review → not relevant
- Resume optimization → use [recruiter-lens](https://github.com/arm-pz/recruiter-lens)

## Related

- **[findable](https://github.com/arm-pz/findable)** — Make repos discoverable (the audit half)
- **[wordsmith](https://github.com/arm-pz/wordsmith)** — Rewrite text clearly (the polish half)
- **[keyword-resolver](https://github.com/arm-pz/keyword-resolver)** — Fix keyword cannibalization between pages

## License

MIT © Abdul Rahman P Z

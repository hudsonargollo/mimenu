---
name: findable-polish
description: >-
  Audit content for discoverability gaps with the Findable skill, then generate
  improved alternatives with Wordsmith. Use when the user wants to improve SEO,
  search visibility, or findability of a repo README, skill page, landing page,
  article, or marketing copy — and wants both the diagnosis and concrete rewrites.
  Chains findable (audit) → wordsmith (alternatives) in one workflow. Not for
  tuning SKILL.md trigger language (use tune-skill), not for code review, and
  not for resume optimization (use recruiter-lens).
version: 1.0.0
argument-hint: "[target text | file path]"
user-invocable: true
metadata:
  version: "1.0.0"
---

# Findable-Polish

Chain two existing skills into a single workflow: **Findable** audits content for discoverability issues, then **Wordsmith** generates polished alternatives that fix those issues. The user gets both the diagnosis and the cure in one pass.

## Invocation

```text
/findable-polish [paste content]
/findable-polish path/to/file.md
Audit this README for findability.
```

If no target is provided, ask the user to paste the text or give a file path.

## Workflow

### Phase 1: Run Findable Audit

Invoke the **Findable skill** with the target content:

1. Extract what the content says it does, who it is for, and its key features.
2. Derive 5–10 search queries a stranger would type (task-based, not name-based).
3. Identify findability gaps: missing keywords, vague descriptions, same-name collisions, weak opening lines, absent topics/About text.
4. Output: a structured audit report listing each problem with its severity.

**Handoff rule:** Capture Findable's full audit output verbatim. Do not summarize yet.

### Phase 2: Generate Alternatives with Wordsmith

Pass Findable's audit findings to the **Wordsmith skill** with this instruction:

```
For each findability issue identified below, generate 2–3 alternative versions
that address it while preserving the author's meaning and voice. Focus on:

- Opening sentences that match real search queries
- Clearer descriptions of capabilities and audience
- Keywords naturally woven into headings and body text
- GitHub About text and topic suggestions (if applicable)
- Any other surface Findable flagged

Original audit:
[Paste Findable's full report here]

Target content:
[Paste the original content here]
```

Wordsmith should:
- Treat each audit finding as a separate rewrite task
- Provide 2–3 options per finding (labeled Option A/B/C)
- Keep the author's voice and facts intact
- Highlight which option best solves each issue

### Phase 3: Present Results

Return a three-part response:

1. **Findable Audit Summary** (bulleted, highest-severity first)
2. **Wordsmith Alternatives** (grouped by issue, with options labeled)
3. **Recommendation** (which combination of alternatives gives the strongest overall improvement, in 2–3 sentences)

Format the alternatives so the user can copy-paste directly into their file.

## Example

```
User: /findable-polish

# My Skill

A tool for developers.

Assistant:

## Findable Audit

1. **Vague description** — "A tool for developers" does not say what it does or for whom. Severity: High
2. **No search queries addressed** — Content lacks keywords like "agent skill", "CLI", "workflow". Severity: High
3. **Missing audience** — Does not state if it is for Python devs, JS devs, etc. Severity: Medium

## Wordsmith Alternatives

### Issue 1: Vague description

**Option A:** A Qoder skill that audits GitHub repos for discoverability gaps and drafts SEO-friendly metadata.
**Option B:** Helps developers make their repos, skills and CLI tools easier to find via search engines and agent directories.
**Option C:** Audits your project's README, About text and topics, then writes copy that matches what people actually search for.

→ Best: Option C (most specific about the workflow)

[... continues for each issue ...]

## Recommendation

Use Option C for the opening line, add "agent skill, SEO audit, GitHub discovery" to the second sentence, and specify "for developers publishing open-source tools" to resolve Issue 3. This combination addresses all high-severity gaps in under 40 words.
```

## Boundaries

- **Does not** tune SKILL.md frontmatter `description` for agent triggering (that is tune-skill's job).
- **Does not** review code quality or logic (use a code-review skill).
- **Does not** optimize resumes or career documents (use recruiter-lens).
- **Does not** execute `gh repo edit` or push changes — it drafts the kit and hands over commands for the user to run.

## Dependencies

This skill requires both `findable` and `wordsmith` to be installed. If either is missing, tell the user and stop.

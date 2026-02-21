# LighterPack LLM Modernization Proposal

## Goals
- Build a modern service inspired by LighterPack that helps users create, analyze, and share gear lists.
- Use LLMs to reduce manual data entry, improve organization, and provide decision support.

## Core LLM Features
1. **Smart item entry**
   - Paste text, receipts, or product links and auto-extract item name, weight, category, and price.
   - Normalize units and flag missing or suspicious weights.
2. **List refinement**
   - Auto-categorize items (shelter, sleep, cook, etc.) and suggest reorganizations.
   - Detect duplicates or redundant items across categories.
3. **What-if planning**
   - Generate alternate pack configurations for different trip styles and weather.
   - Explain tradeoffs (weight vs. warmth, durability vs. cost) in plain language.
4. **Personalized recommendations**
   - Suggest lighter alternatives or multi-use items based on user preferences.
   - Respect constraints such as budget, base weight targets, and comfort priorities.
5. **Sharing & collaboration**
   - Summarize lists for sharing (e.g., “3-season weekend pack summary”).
   - Provide “diff” summaries when a shared list changes.

## Data Model Ideas
- **Item**: name, description, weight, unit, category, cost, consumable, worn, quantity, URL, image.
- **Pack**: name, trip details, location, season, target base weight, notes.
- **Insight**: LLM-generated summaries, suggestions, and tradeoff notes.

## UX/UI Modernization
- Clean, mobile-first interface with quick add and inline editing.
- Visual base weight breakdown with drill-down category charts.
- Inline “LLM helper” panel for summaries and suggestions.

## MVP Scope
- Import lists from CSV and plain text.
- LLM-assisted item parsing and category suggestion.
- Base weight calculations and shareable public links.

## Next Steps
- Validate the feature list with target users (ultralight hikers).
- Decide LLM provider and cost controls (prompt caching, usage caps).
- Create a data ingestion pipeline for item parsing.

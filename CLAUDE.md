# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run only failing tests
npm run test:fails
```

### Development
```bash
# Format code
npm run format

# Check formatting
npm run format-check

# Start MCP server locally
npm run mcp-server

# Run MCP inspector for debugging
npm run inspector
```

### Build and Release
```bash
# Prepare package (sets permissions)
npm run prepare

# Version management
npm run changeset
npm run release
```

## Chapter Master Transformation Plan

**TRANSFORMATION IN PROGRESS**: Converting Task Master into Chapter Master - an AI-driven book writing system that transforms story premises into complete novels with professional quality controls.

## Target Architecture: Professional Story Development Pipeline

### **Phase 1: Foundation & Research**
```
PREMISE.md → Genre Analysis → Market Research → Story Bible Creation
```

**Enhanced Input Processing:**
- **Genre Detection**: Auto-identify and apply genre conventions
- **Market Research**: AI research current market trends, successful comparable titles
- **Thematic Analysis**: Extract core themes, messages, target audience
- **Story Bible**: Central document tracking all story elements, rules, constraints

### **Phase 2: Professional Story Architecture**

**Multiple Structure Options:**
- **Save the Cat! Writes a Novel** (15-beat structure)
- **Hero's Journey** (Campbell's monomyth)
- **Three-Act Structure** (with midpoint)
- **Seven-Point Story Structure**
- **Genre-Specific Templates** (Romance beats, Mystery structure, etc.)

**Advanced Outline Generation:**
```
./story-bible/
├── premise.md                 # Original + refined
├── story-structure.md         # Chosen structure with beats
├── themes-and-messages.md     # Core thematic elements
├── world-building/            # Setting, rules, research
├── plot-threads.md           # Main plot + subplots
└── pacing-analysis.md        # Chapter-by-chapter pacing
```

### **Phase 3: Advanced Character Development**

**Comprehensive Character System:**
```
./characters/
├── protagonist/
│   ├── biography.md          # Full backstory
│   ├── psychology.md         # Motivations, fears, goals
│   ├── arc-progression.md    # Character growth timeline
│   ├── voice-and-dialogue.md # Speech patterns, vocabulary
│   └── relationships.md      # Connections to other characters
├── antagonist/
├── supporting/
└── character-consistency.json # Tracking traits, changes
```

**Character Features:**
- **Arc Tracking**: Monitor character growth across chapters
- **Consistency Checking**: Flag contradictions in traits/behavior
- **Relationship Mapping**: Track evolving dynamics
- **Voice Analysis**: Maintain distinct speech patterns

### **Phase 4: Scene-Level Excellence**

**Chapter Structure:**
```
./chapters/
├── chapter-01/
│   ├── chapter-outline.md    # Purpose, goals, beats
│   ├── scenes/
│   │   ├── scene-01.md      # Full scene with tags
│   │   └── scene-02.md
│   ├── character-notes.md    # Who appears, their state
│   └── continuity-check.md   # References to previous chapters
```

**Scene Quality Controls:**
- **Story Beat Tracking**: Ensure each scene serves story purpose
- **Pacing Analysis**: Monitor tension, revelation, character moments
- **Continuity Validation**: Auto-check references to characters, world elements
- **Conflict Tracking**: Ensure adequate tension in each scene

### **Phase 5: Quality Assurance & Iteration**

**Multi-Level Validation:**
1. **Structural Analysis**: Does story follow chosen beats?
2. **Character Arc Validation**: Are character changes earned?
3. **Plot Thread Resolution**: Are all threads properly concluded?
4. **Pacing Assessment**: Proper build-up, climax, resolution?
5. **Consistency Audit**: Character, world, timeline consistency

**Iterative Refinement:**
- **Chapter Review System**: AI-powered developmental editing suggestions
- **Feedback Integration**: Track revisions and improvements
- **Version Control**: Maintain chapter versions and evolution
- **Quality Metrics**: Track story strength, character development, pacing

### **Phase 6: Professional Polish**

**Editorial Features:**
- **Line-Level Editing**: Prose improvement suggestions
- **Style Consistency**: Maintain voice throughout
- **Technical Accuracy**: Fact-checking, research validation
- **Format Preparation**: Ready for beta readers, editors

### **AI Integration Enhancements**

**Specialized AI Roles:**
- **Story Architect**: Structure and plot development
- **Character Psychologist**: Deep character development
- **Research Assistant**: World-building, fact-checking
- **Style Editor**: Prose improvement, voice consistency
- **Market Analyst**: Genre conventions, reader expectations

**Research Integration:**
- **Real-time fact checking** during writing
- **Historical/technical accuracy** validation
- **Cultural sensitivity** review
- **Market trend** incorporation

### **Editor Integration Commands**

```
"What's the next scene to write?"
"Analyze character consistency for [character]"
"Review pacing for last three chapters"
"Research [topic] for world-building"
"Check if this scene serves the story structure"
"Generate character development suggestions"
"What plot threads need resolution?"
```

## Current Project Architecture (Pre-Transformation)

This system was originally Task Master - an AI-driven task management system designed to work with Claude and Cursor AI. The codebase has two main runtime modes:

### 1. CLI Mode (`scripts/` directory)
- Entry point: `index.js` and `bin/task-master.js`
- Module-based architecture in `scripts/modules/`
- Task management logic in `scripts/modules/task-manager/`
- Configuration management in `scripts/modules/config-manager.js`
- AI services unified in `scripts/modules/ai-services-unified.js`

### 2. MCP Server Mode (`mcp-server/` directory)
- Entry point: `mcp-server/server.js`
- Core logic: `mcp-server/src/core/task-master-core.js`
- MCP tools: `mcp-server/src/tools/`
- Direct functions: `mcp-server/src/core/direct-functions/`

### Key Components

**Configuration System**: Centralized in `config-manager.js` with support for:
- Multiple AI providers (Anthropic, OpenAI, Google, Perplexity, etc.)
- Model role configuration (main, research, fallback)
- Global settings and project-specific overrides
- Config files: `.taskmaster/config.json` (new) or `scripts/config.json` (legacy)

**Task Management**: 
- Tasks stored in `.taskmaster/tasks.json`
- Hierarchical structure with subtasks and dependencies
- Status tracking (todo, in-progress, completed, blocked)
- Priority system and complexity analysis

**AI Integration**:
- Multiple AI provider support via `ai-services-unified.js`
- Model-specific parameter handling
- API key validation and environment variable management
- Research model support for enhanced analysis

**MCP Integration**:
- FastMCP-based server for editor integration
- Tool registration system for editor commands
- Context management for AI interactions

## File Structure Patterns

- `**/direct-functions/` - Core business logic implementations
- `**/tools/` - MCP tool wrappers and CLI command handlers  
- `**/modules/` - Shared utility modules
- `tests/` - Jest test suites with unit, integration, and E2E tests
- `docs/` - Documentation and guides

## Development Notes

- ESM modules throughout (`"type": "module"` in package.json)
- Jest configured for ESM with `--experimental-vm-modules`
- Biome for formatting instead of Prettier
- Support for both global and local npm installation
- MCP server runs via stdio transport for editor integration
- Configuration system supports both new (`.taskmaster/`) and legacy (`scripts/`) locations
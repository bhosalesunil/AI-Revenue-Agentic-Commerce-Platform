# Architectural Decisions & Trade-Offs

## 1. Next.js API Routes instead of FastAPI
- **Decision**: Unify frontend and backend within Next.js 15 App Router.
- **Rationale**: Keeps architecture clean, allows 100% end-to-end TypeScript sharing, avoids multi-service orchestration overhead, and deploys as a single atomic unit.

## 2. Controlled Sandbox Tools over Direct Database / Payment Access
- **Decision**: AI agent communicates strictly through 8 audited tool definitions.
- **Rationale**: Prevents prompt injections from executing arbitrary SQL queries or altering transaction amounts.

## 3. Resilient Database & Mock Fallback Architecture
- **Decision**: Prisma ORM with PostgreSQL primary data source, coupled with an automatic in-memory store fallback.
- **Rationale**: Eliminates local environment setup failures so judges, reviewers, and teammates can test the complete system immediately out-of-the-box.

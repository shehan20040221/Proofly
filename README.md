## Proofly

Proofly is a fullstack project management tool built for freelance designers. It replaces scattered email threads and screenshot feedback with a single place to manage client projects — from initial brief through revisions to final approval.

The standout feature is **pinned-comment proofing**: clients can click directly on a design mockup to leave feedback tied to an exact point on the image, instead of trying to describe "the logo in the top right" in a paragraph of text.

### Features
- Role-based accounts for designers and clients
- Project stages: Briefing → Draft → Revision → Approved
- Mockup uploads with pinned, point-based comments
- Resolve/unresolve feedback threads
- In-app notifications for comments and stage changes
- Per-project invoicing with PDF export

### Tech Stack
- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** NestJS (or Express), JWT auth
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** AWS S3
- **Deployment:** Vercel (frontend), Render/Railway (backend)

# Kent Events

## Overview

Kent Events is an event management application built with React and Node.js, backed by MySQL and containerized using Docker Compose.

## Tech Stack

- Frontend: React
- Backend: Node.js
- Database: MySQL
- Testing: Vitest & Supertest
- Containerization: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Verify Docker

```bash
docker --version
docker compose version
```

### Stop / Rebuild / Start

```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```

## Testing

Server tests run from the `server` directory.

```bash
cd server
npm test
```

To run a subset of tests, use a pattern:

```bash
npm test -- "^auth"
npm test -- "^auth.login"
```

## Documentation

- **Technical Report:** <https://docs.google.com/document/d/1CGVLdbOW_-rIPZs84L8Uq1hVenXK73U6aaddA-_L-TE/edit?tab=t.0>
- **Testing Report:** <https://docs.google.com/document/d/1TjcMOh88t4Z80yA6RCgkCoSDmjAs7lqegykTRR6xX5A/edit?tab=t.0>
- **Meeting Notes:** <https://docs.google.com/document/d/1rPF2KjEgII_I8zfD8FKEu6J6l83rChvJJISCFXZX54E/edit?tab=t.0#heading=h.sbsgs1f9jaty>

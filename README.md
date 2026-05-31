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

- **Technical Report:** [Technical Report](docs/Technical%20Report.pdf)
- **Testing Report:** [Testing Report](docs/Testing%20Report.pdf)
- **Meeting Notes:** [Meeting Notes](docs/weekly_meetings.txt)

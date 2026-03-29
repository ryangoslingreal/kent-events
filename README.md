# Kent Events

## Tech Stack
- Docker & Docker Compose
- React & Node.js
- MySQL
- Vitest & Supertest

## Documents
- **Technical Report:** https://docs.google.com/document/d/1CGVLdbOW_-rIPZs84L8Uq1hVenXK73U6aaddA-_L-TE/edit?tab=t.0
- **Testing Report:** https://docs.google.com/document/d/1TjcMOh88t4Z80yA6RCgkCoSDmjAs7lqegykTRR6xX5A/edit?tab=t.0

## Setup & Run

This project is containerised using Docker Compose.

### Prerequisites
- Docker
- Docker Compose

Check Docker is installed:
```bash
docker --version
docker compose version
```

### Running the application
```bash
docker compose up
```
- Could also use
```bash
docker compose up -v
```

### Rebuilding after changes:
```bash
docker compose up --build
```

### Stopping the application
```bash
docker compose down
```


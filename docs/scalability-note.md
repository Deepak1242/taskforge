# Scalability Note

## Current Architecture
- Modular layered backend (`routes -> controllers -> services -> models`) to keep business logic isolated.
- API versioning via `/api/v1` so future versions can be introduced without breaking existing clients.
- JWT stateless authentication for horizontal scaling across multiple backend instances.
- Pagination in task listing to avoid heavy responses as data grows.

## Scaling Path (Next Steps)
- Add Redis for response caching and token/session blacklisting if needed.
- Add rate limiting and API gateway in front of services.
- Split auth and task modules into separate microservices when team/product scale increases.
- Use message queue (RabbitMQ/Kafka) for async workflows (notifications, audit logs).
- Containerize backend/frontend and deploy behind a load balancer with autoscaling.
- Add structured logging and observability stack (Winston + OpenTelemetry + centralized logs).

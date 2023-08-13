# Login API

A login API using NodeJS, ExpressJS and MongoDB.

## Installation

- Rename **.env.sample** to **.env**
- Run the following command to build and run the docker containers.

```bash
docker compose up --build
```

The API can access through the URL [http://localhost:8000/api/auth/signin](http://localhost:8000/api/auth/signin)

## Testing

- Run the following command to build and run the docker containers for testing.

```bash
docker compose -f docker-compose.dev.yml up --build
```

In the **auth** container, run the following command for testing

```bash
npm test
```

# Cooper

Cooper is a tool for Northeastern students to both submit reviews of their co-ops and filter through reviews of co-ops left by other students.

## Features

- [Next.js](https://nextjs.org) - Web development framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Docker](https://www.docker.com/) - Containerization
- [tRPC](https://trpc.io/) - Client-server safety
- [Zod](https://zod.dev/) - Validation

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Running Locally

Before you start you will need the following:

- [Node.js](https://nodejs.org/en)
- [Docker](https://www.docker.com/)
- Recommended: [pnpm](https://pnpm.io/)

1. Clone the repo

```bash
git clone git@github.com:sandboxnu/cooper.git
cd cooper
```

2. Install the necessary dependencies

```bash
pnpm install
```

3. Configure the `.env` file by following the template in `.env.example`. See [Setting up the environment](#setting-up-the-environment).

4. Run the docker container

```bash
docker compose up -d
```

> **Note:** The `docker-compose.yml` file sets the `POSTGRES_USER` as "admin", `POSTGRES_PASSWORD` as "admin", and `POSTGRES_DB` as "cooper" by default.

5. Generate the Prisma Client

```bash
pnpm dlx prisma generate
```

6. Run the application

```bash
pnpm run
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

### Setting up the environment

1. Create a new file called `.env` or copy the `.env.example` and rename it to `.env`.

```bash
cp .env.example .env
```

2. Complete the file to add your environment variables.

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/cooper?schema=public"
NEXTAUTH_URL="http://localhost:3000/"

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

To generate `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, see [Setting up OAuth 2.0](https://support.google.com/cloud/answer/6158849?hl=en).
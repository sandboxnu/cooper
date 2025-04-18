# Cooper

Cooper is a tool for Northeastern students to both submit reviews of their co-ops and filter through reviews of co-ops left by other students.

## The Cooper Docs

Read our docs [cooper-docs-sandboxneu.vercel.app](https://cooper-docs-sandboxneu.vercel.app/) !

## Features

- [Next.js](https://nextjs.org/) - Web development framework
- [tRPC](https://trpc.io/) - End-to-end typesafe API
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Pre-built components
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Drizzle](https://orm.drizzle.team/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Docker](https://www.docker.com/) - Database containerization for local development
- [Zod](https://zod.dev/) - Validation

### Future

- [Vitest](https://vitest.dev/) - Unit tests
- [Playwright](https://playwright.dev/) - E2E tests

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-turbo`. See [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)!

## Dependencies

Before you start you will need the following:

- [Node.js](https://nodejs.org/en)
- [Docker](https://www.docker.com/)\*
- [pnpm](https://pnpm.io/)

> [!NOTE]
> Setting up the database for local development is currently a work in progress given that the Drizzle connector only supports connections to Vercel / Neon. The documentation will be updated with new instructions for using the Postgres Docker container.
>
> You do _not_ need Docker as of now.

## Setup Instructions

1. Clone the repo

```bash
git clone git@github.com:sandboxnu/cooper.git
cd cooper
```

2. Install the necessary dependencies.

```bash
pnpm install
```

3. Configure the `.env` file by following the template in `.env.example`. See [Environment File](#environment-file).

## Environment File

1. Create a new file called `.env` or copy the `.env.example` and rename it to `.env`.

```bash
cp .env.example .env
```

2. Complete the file to add your environment variables. These are the defaults for local development. Make sure that the `docker` container is running.

```env
POSTGRES_URL='<url>'

AUTH_SECRET='supersecret'

AUTH_GOOGLE_ID=''
AUTH_GOOGLE_SECRET=''
```

### Database

While the Node Postgres work is in progress, the best way to get a Postgres database up and running that supports the existing database connection code would be through [Neon](https://console.neon.tech/).

1. Sign in using your GitHub account
2. Create a new **Project**
3. Copy the **Connection String**. Make sure that **Pooled connection** is checked.

### Authentication

To generate `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, see [Setting up OAuth 2.0](https://support.google.com/cloud/answer/6158849?hl=en). Ensure that you set the value of Authorized JavaScript origins and Authorized redirect URIs to the appropriate URLs. To generate a new `AUTH_SECRET`, run the following command in your terminal and add it to the `.env` file.

```bash
openssl rand -base64 32
```

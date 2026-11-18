::: {align="center"}
`<img src="docs/images/cloudsync-banner.jpg" alt="CloudSync — Personal cloud storage" width="100%" />`{=html}

```{=html}
<p>
```
`<strong>`{=html}A private home for your files.`</strong>`{=html}
```{=html}
</p>
```
```{=html}
<p>
```
Organize, manage, and access your photos, documents, and files through a
clean, responsive cloud-drive experience.
```{=html}
</p>
```
```{=html}
<p>
```
`<a href="https://github.com/Mrbunny-web/cloudsync">`{=html}`<img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub repository">`{=html}`</a>`{=html}
`<img src="https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js" alt="Next.js 16.4.6">`{=html}
`<img src="https://img.shields.io/badge/React-19.3.0-149ECA?style=for-the-badge&logo=react" alt="React 19.3.0">`{=html}
`<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">`{=html}
`<img src="https://img.shields.io/badge/Supabase-Optional-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">`{=html}
```{=html}
</p>
```
```{=html}
<p>
```
`<a href="#features">`{=html}Features`</a>`{=html} ·
`<a href="#getting-started">`{=html}Get started`</a>`{=html} ·
`<a href="#supabase-setup">`{=html}Supabase setup`</a>`{=html} ·
`<a href="#project-structure">`{=html}Project structure`</a>`{=html} ·
`<a href="#known-limitations">`{=html}Limitations`</a>`{=html}
```{=html}
</p>
```
:::

------------------------------------------------------------------------

## Overview

**CloudSync** is a personal cloud-drive web application for keeping
files organized in one place. It provides a drive-style interface with
file and folder management, search, sorting, starred items, trash, and
grid/list views.

The project supports two data modes:

-   **Local mode:** starts without Supabase credentials and stores app
    data in the current browser using `localStorage` and IndexedDB.
-   **Supabase mode:** connects to Supabase for authentication, database
    records, and private file storage when the required environment
    variables and database setup are configured.

> **Important:** Local mode is browser- and origin-specific. It is
> useful for trying the interface, but it is not a substitute for a
> production multi-user backend.

## Features

-   **Drive dashboard** --- browse files and folders in a familiar
    workspace.
-   **File uploads** --- upload your own files and manage them in the
    drive.
-   **Search and sorting** --- find items and organize the file list.
-   **Grid and list layouts** --- switch between visual file cards and a
    compact list.
-   **Starred items** --- keep frequently used files close at hand.
-   **Trash management** --- move deleted items to the trash area.
-   **Authentication screens** --- sign-in and registration interfaces.
-   **Responsive navigation** --- application navigation designed for
    desktop and mobile layouts.
-   **Optional Supabase integration** --- use Supabase authentication,
    database records, and signed storage URLs after configuration.

## Technology stack

  -----------------------------------------------------------------------------------
  Technology                                      Role
  ----------------------------------------------- -----------------------------------
  [Next.js](https://nextjs.org/) 16               React framework and application
                                                  routing

  [React](https://react.dev/) 19                  User interface

  [TypeScript](https://www.typescriptlang.org/)   Static typing

  [Tailwind CSS](https://tailwindcss.com/) 4      Styling

  [Supabase](https://supabase.com/)               Optional authentication, database,
                                                  and storage backend

  [Lucide React](https://lucide.dev/)             Interface icons
  -----------------------------------------------------------------------------------

## Getting started

### Prerequisites

Install the following before running the project:

-   [Node.js](https://nodejs.org/) (use a current LTS release)
-   npm (included with Node.js)
-   [Git](https://git-scm.com/) to clone the repository

### 1. Clone the repository

``` bash
git clone https://github.com/Mrbunny-web/cloudsync.git
cd cloudsync
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Start the development server

``` bash
npm run dev
```

Open <http://localhost:3000> in your browser.

CloudSync starts in **local mode** when Supabase environment variables
are not configured. You can explore the interface without setting up an
external backend.

## Supabase setup

To use Supabase mode, you need a Supabase project and its project URL
and publishable/anon client key.

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com/), then open
**Project Settings → API** to find the project URL and client key.

### 2. Configure environment variables

Create a file named `.env.local` in the project root:

``` env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_CLIENT_KEY
```

Replace the placeholder values with your own project values. Do not
commit `.env.local` or expose a service-role key in browser-side code.

### 3. Apply the database schema

In your Supabase dashboard, open **SQL Editor**. Run the SQL statements
from these files in order:

1.  [`database/schema.sql`](database/schema.sql)
2.  [`database/002_features.sql`](database/002_features.sql)

### 4. Create the storage bucket

In **Supabase → Storage**, create a bucket named:

``` text
cloudsync
```

Keep the bucket private. Review the project's storage policies and
database row-level security policies before using real or sensitive user
data.

### 5. Restart the application

``` bash
npm run dev
```

The application detects the Supabase configuration and uses the
configured backend.

## Available scripts

  Command           Description
  ----------------- --------------------------------------
  `npm run dev`     Start the local development server
  `npm run build`   Create an optimized production build
  `npm run start`   Run the production build
  `npm run lint`    Run ESLint

## Deployment

CloudSync is a Next.js application and can be deployed to a platform
that supports Next.js.

### Deploy with Vercel

1.  Push the repository to your GitHub account.
2.  Import `Mrbunny-web/cloudsync` into [Vercel](https://vercel.com/).
3.  If deploying in local/demo mode, leave the Supabase variables unset.
4.  If deploying with Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and
    `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project's
    environment-variable settings.
5.  Deploy and verify the deployed application.

For other hosting providers, follow their current Next.js deployment
documentation and configure the same environment variables when using
Supabase.

**No public demo URL is listed here because a live deployment has not
been verified.**

## Project structure

``` text
cloudsync/
├── database/
│   ├── schema.sql
│   └── 002_features.sql
├── docs/
│   └── images/
│       └── cloudsync-banner.svg
├── public/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── auth/
│   │   ├── settings/
│   │   └── ...
│   ├── components/
│   └── lib/
│       └── cloud/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

The tree highlights the main areas of the repository. Refer to the
source directory for the complete and current route and component list.

## Design approach

CloudSync uses a clean, file-first interface intended to keep the
workspace easy to scan. The application includes responsive navigation,
reusable interface components, and a consistent styling system.

## Known limitations

Please keep these distinctions in mind when evaluating or deploying the
current project:

-   **Local data is local:** local-mode accounts and file metadata are
    stored in the browser. Clearing browser site data can remove that
    local data.
-   **Local mode is not production authentication:** its browser-based
    authentication flow is not a security boundary for sensitive
    accounts or files.
-   **Sample content:** sample files may contain metadata only;
    downloading is intended for files uploaded by the user.
-   **Sharing:** file sharing is not currently implemented as a complete
    user-facing feature.
-   **Supabase requires setup:** Supabase mode needs environment
    variables, database migrations, a private `cloudsync` storage
    bucket, and correctly configured access policies.

Review authentication, database policies, storage policies, and upload
limits before using CloudSync with sensitive information or opening it
to public users.

## Contributing

Contributions, bug reports, and improvement suggestions are welcome.

1.  Fork the repository.

2.  Create a feature branch.

3.  Make your changes.

4.  Run the checks:

    ``` bash
    npm run lint
    npm run build
    ```

5.  Open a pull request describing the change.

For larger changes, consider opening an issue first to discuss the
approach.

## License

No standalone `LICENSE` file was visible in the repository when this
README was prepared. Until a license is added, do not assume that the
project is available for unrestricted reuse. Add a license file if you
intend to grant permissions to use, modify, and distribute the project.

------------------------------------------------------------------------

::: {align="center"}
**CloudSync**\
*Every file, in one calm place.*

[View repository](https://github.com/Mrbunny-web/cloudsync) · [Report an
issue](https://github.com/Mrbunny-web/cloudsync/issues)
:::

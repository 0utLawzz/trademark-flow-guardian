# Architecture Documentation

## Core Architecture

This is a modern React web application built with Vite and Supabase.

```mermaid
graph TD
    App[React + Vite Frontend] --> Supabase[(Supabase Backend as a Service)]
    Supabase --> Postgres[(PostgreSQL)]
    Supabase --> Auth[Supabase Auth]
```

## Technologies

- **Frontend:** React, Vite, Tailwind CSS.
- **Backend/DB:** Supabase (PostgreSQL).
- **Runtime:** Node.js / Bun.

---

## 👨‍💻 Credits

**By OutLawZ™** | https://www.brandex.pk | net2tara@gmail.com

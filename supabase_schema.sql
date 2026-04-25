-- Supabase table schema for `issues`

create table if not exists public.issues (
  id text primary key,
  issueNumber integer not null,
  location text,
  description text,
  shopDrawing jsonb,
  siteImage jsonb,
  status text,
  solution text,
  createdAt timestamptz,
  closedAt timestamptz,
  updatedAt timestamptz
);

create index if not exists idx_issues_createdat on public.issues (createdAt desc);

-- Example: insert a sample row
-- insert into public.issues (id, issueNumber, location, description, shopDrawing, status, createdAt, updatedAt)
-- values ('0001', 1, 'Site A', 'Sample issue', '{"data":"...","filename":"img.jpg","thumbnail":"..."}'::jsonb, 'Open', now(), now());

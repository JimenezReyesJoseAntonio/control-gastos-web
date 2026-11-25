create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table if not exists tarjetas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo text not null default 'credito',
  fecha_corte int,
  fecha_limite_pago int,
  created_at timestamptz default now()
);

create table if not exists compras (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tarjeta_id bigint references tarjetas(id) on delete set null,
  que_compre text not null,
  tienda text,
  fecha_compra date not null default current_date,
  total numeric(12,2) not null,
  meses int not null default 1,
  mensualidad numeric(12,2) not null,
  mes_inicio date not null,
  mes_fin date not null,
  estatus text not null default 'activa',
  nota text,
  created_at timestamptz default now()
);

create table if not exists pagos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  compra_id bigint not null references compras(id) on delete cascade,
  mes date not null,
  monto numeric(12,2) not null,
  pagado boolean not null default false,
  fecha_pago date,
  created_at timestamptz default now(),
  unique(compra_id, mes)
);

alter table tarjetas enable row level security;
alter table compras enable row level security;
alter table pagos enable row level security;
alter table profiles enable row level security;

create policy "Usuarios ven solo lo suyo" on tarjetas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Usuarios ven solo lo suyo" on compras
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Usuarios ven solo lo suyo" on pagos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Usuarios ven solo lo suyo" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

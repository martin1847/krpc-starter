-- Runs once on first container init (empty data dir, superuser context). Application tables are
-- created by Flyway at app startup, NOT here — keep this for one-time superuser setup only
-- (e.g. CREATE EXTENSION, roles). Left intentionally minimal for the starter.
select 'bookshelf-starter db initialized' as init_note;

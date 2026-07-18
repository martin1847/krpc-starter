-- V1: bookshelf schema. Amounts in integer cents (int); identity PK; a couple of seed rows so the
-- read endpoints return data out of the box. Flyway applies this at startup
-- (quarkus.flyway.migrate-at-start=true).
create table book (
    id             bigint       generated always as identity primary key,
    title          varchar(200) not null,
    author         varchar(200) not null,
    isbn           varchar(20),
    price_cents    int          not null,
    published_year int
);

create index idx_book_author on book (author);

insert into book (title, author, isbn, price_cents, published_year) values
    ('The Pragmatic Programmer', 'Andrew Hunt',    '9780135957059', 4999, 2019),
    ('Clean Architecture',       'Robert Martin',  '9780134494166', 3799, 2017),
    ('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 5499, 2017),
    ('Release It!',              'Michael Nygard', '9781680502398', 4299, 2018);

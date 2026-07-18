import { useQuery } from '@tanstack/react-query';
import { bookshelfService, rpcQuery, type BookDetail, type BookListResult } from '@krpc-starter/api';

/**
 * Bookshelf reads — the list/detail template wired to the generated krpc client (contract SoT),
 * talking to the local krpc-service-starter backend. Each query goes through `rpcQuery` -> `unwrap`,
 * so a non-OK envelope (e.g. a missing book) becomes the query's error state.
 */

/** listBooks — the four seeded books, optionally filtered by an author substring. */
export function useBooks(authorContains?: string) {
  const filter = authorContains?.trim() ?? '';
  return useQuery(
    rpcQuery<BookListResult>(['Bookshelf/listBooks', filter], (cfg) =>
      bookshelfService.listBooks(filter ? { authorContains: filter } : {}, cfg),
    ),
  );
}

/** getBook — one book by id. `enabled` gates the call on a non-empty id. */
export function useBook(bookId: string) {
  return useQuery({
    ...rpcQuery<BookDetail>(['Bookshelf/getBook', bookId], (cfg) =>
      bookshelfService.getBook({ bookId }, cfg),
    ),
    enabled: bookId.trim().length > 0,
  });
}

package com.example.bookshelf.server;

import java.util.ArrayList;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import io.quarkus.arc.Unremovable;
import jakarta.inject.Inject;

import org.jboss.logging.Logger;
import io.opentelemetry.api.trace.Span;

import tech.krpc.model.CommonCode;
import tech.krpc.model.RpcResult;

import com.example.bookshelf.api.BookshelfService;
import com.example.bookshelf.api.dto.GetBookReq;
import com.example.bookshelf.api.dto.BookDetail;
import com.example.bookshelf.api.dto.ListBooksReq;
import com.example.bookshelf.api.dto.BookListResult;
import com.example.bookshelf.api.dto.BookCountResult;

import com.example.bookshelf.server.mapper.BookshelfMapper;
import com.example.bookshelf.server.model.BookRow;

/**
 * BookshelfService implementation (read side).
 *
 * <p><b>Soft vs hard errors (krpc SPEC §3):</b> business failures RETURN a non-OK RpcResult —
 * they do not throw. Bad id → INVALID_ARGUMENT, missing row → NOT_FOUND, empty list → OK with an
 * empty list. Only system/validation/unexpected errors throw (the server wraps those in a gRPC
 * Status). Big-integer ids cross the contract as String; the server parses to Long and maps the
 * persistence row to the contract DTO by hand.
 *
 * <p>{@code @ApplicationScoped} + {@code @Unremovable}: krpc discovers @RpcService impls as CDI
 * beans; with no {@code @Inject} referencing it, ARC could prune the bean (packaged jar would then
 * expose 0 services), so pin it Unremovable.
 */
@ApplicationScoped
@Unremovable
public class BookshelfServiceImpl implements BookshelfService {

    @Inject
    BookshelfMapper bookshelfMapper;

    private static final Logger LOG = Logger.getLogger(BookshelfServiceImpl.class);

    @Override
    public RpcResult<BookDetail> getBook(GetBookReq req) {
        long id;
        try {
            id = Long.parseLong(req.getBookId());
        } catch (NumberFormatException e) {
            // Soft error: malformed id is a business failure, not an exception.
            return RpcResult.error(CommonCode.INVALID_ARGUMENT);
        }

        BookRow row = bookshelfMapper.getBook(id);
        if (row == null) {
            return RpcResult.error(CommonCode.NOT_FOUND);
        }
        return RpcResult.ok(toDetail(row));
    }

    @Override
    public RpcResult<BookListResult> listBooks(ListBooksReq req) {
        // Blank filter → null → "all books". Empty result is a valid OK (not NOT_FOUND).
        String filter = req.getAuthorContains();
        if (filter != null && filter.isBlank()) {
            filter = null;
        }

        List<BookRow> rows = bookshelfMapper.listBooks(filter);
        List<BookDetail> list = new ArrayList<>(rows.size());
        for (BookRow row : rows) {
            list.add(toDetail(row));
        }

        // Observability: attach a result count to the built-in server span (krpc 1.1.1 interceptor
        // opened it — no hand-written filter). Wide event: stable name, variables in fields.
        Span.current().setAttribute("book.count", (long) list.size());
        LOG.infof("bookshelf_list_books count=%d filtered=%b", list.size(), filter != null);

        BookListResult result = new BookListResult();
        result.setList(list);
        return RpcResult.ok(result);
    }

    @Override
    public RpcResult<BookCountResult> countBooks() {
        BookCountResult result = new BookCountResult();
        result.setTotal((int) bookshelfMapper.countBooks());
        return RpcResult.ok(result);
    }

    /** Map a persistence row to the contract DTO (id → String, integer-cents passed through). */
    private static BookDetail toDetail(BookRow row) {
        BookDetail dto = new BookDetail();
        dto.setBookId(String.valueOf(row.getId()));
        dto.setTitle(row.getTitle());
        dto.setAuthor(row.getAuthor());
        dto.setIsbn(row.getIsbn());
        dto.setPriceCents(row.getPriceCents());
        dto.setPublishedYear(row.getPublishedYear());
        return dto;
    }
}

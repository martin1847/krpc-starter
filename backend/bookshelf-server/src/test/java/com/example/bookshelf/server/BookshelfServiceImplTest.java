package com.example.bookshelf.server;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;

import javax.sql.DataSource;

import jakarta.inject.Inject;

import org.junit.jupiter.api.Test;

import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;

import tech.krpc.model.CommonCode;
import tech.krpc.model.RpcResult;

import com.example.bookshelf.api.dto.GetBookReq;
import com.example.bookshelf.api.dto.BookDetail;
import com.example.bookshelf.api.dto.ListBooksReq;
import com.example.bookshelf.api.dto.BookListResult;

/**
 * Integration test (@QuarkusTest + @TestTransaction, against the dev PG). Each test seeds via raw
 * SQL inside the same JTA transaction (visible to the query, rolled back after — never pollutes the
 * seed data from V1). Covers the soft-error contract: bad id → INVALID_ARGUMENT, missing → NOT_FOUND,
 * empty filter result → OK with an empty list; plus field mapping (id → String, integer cents).
 */
@QuarkusTest
public class BookshelfServiceImplTest {

    @Inject
    BookshelfServiceImpl service;

    @Inject
    DataSource ds;

    @Test
    @TestTransaction
    void getBook_returnsMappedFields() {
        long id = insertBook("Refactoring", "Martin Fowler", "9780134757599", 5299, 2018);

        RpcResult<BookDetail> r = getBook(String.valueOf(id));
        assertTrue(r.isOk(), "getBook should succeed");
        BookDetail b = r.getData();
        assertEquals(String.valueOf(id), b.getBookId(), "id mapped to String");
        assertEquals("Refactoring", b.getTitle());
        assertEquals("Martin Fowler", b.getAuthor());
        assertEquals(Integer.valueOf(5299), b.getPriceCents(), "integer cents passed through");
        assertEquals(Integer.valueOf(2018), b.getPublishedYear());
    }

    @Test
    @TestTransaction
    void getBook_nonNumericId_returnsInvalidArgument() {
        RpcResult<BookDetail> r = getBook("not-a-number");
        assertFalse(r.isOk());
        assertEquals(CommonCode.INVALID_ARGUMENT.value, r.getCode(), "bad id → INVALID_ARGUMENT");
    }

    @Test
    @TestTransaction
    void getBook_missing_returnsNotFound() {
        RpcResult<BookDetail> r = getBook("999999999");
        assertFalse(r.isOk());
        assertEquals(CommonCode.NOT_FOUND.value, r.getCode(), "missing row → NOT_FOUND");
    }

    @Test
    @TestTransaction
    void listBooks_filtersByAuthor_orderedByTitle() {
        insertBook("Book B", "Ada Lovelace", null, 1000, 2001);
        insertBook("Book A", "Ada Lovelace", null, 1200, 2002);
        insertBook("Other",  "Grace Hopper", null, 1500, 2003);

        BookListResult res = ok(listBooks("lovelace"));   // ilike is case-insensitive
        List<BookDetail> list = res.getList();
        assertEquals(2, list.size(), "only Ada Lovelace's books");
        assertEquals("Book A", list.get(0).getTitle(), "ordered by title");
        assertEquals("Book B", list.get(1).getTitle());
    }

    @Test
    @TestTransaction
    void listBooks_noMatch_returnsEmptyListAndOk() {
        RpcResult<BookListResult> r = listBooks("no-such-author-xyz");
        assertTrue(r.isOk(), "no match should be OK, not NOT_FOUND");
        assertTrue(r.getData().getList().isEmpty(), "empty list");
    }

    // ───────────────────────── helpers ─────────────────────────

    private RpcResult<BookDetail> getBook(String bookId) {
        GetBookReq req = new GetBookReq();
        req.setBookId(bookId);
        return service.getBook(req);
    }

    private RpcResult<BookListResult> listBooks(String authorContains) {
        ListBooksReq req = new ListBooksReq();
        req.setAuthorContains(authorContains);
        return service.listBooks(req);
    }

    private static BookListResult ok(RpcResult<BookListResult> r) {
        assertTrue(r.isOk(), "listBooks should succeed");
        return r.getData();
    }

    private long insertBook(String title, String author, String isbn, int priceCents, int publishedYear) {
        String isbnLit = isbn == null ? "null" : "'" + isbn + "'";
        return insertReturningId(
                "insert into book (title, author, isbn, price_cents, published_year) values ('"
                        + title + "', '" + author + "', " + isbnLit + ", " + priceCents + ", " + publishedYear
                        + ") returning id");
    }

    private long insertReturningId(String sql) {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            rs.next();
            return rs.getLong(1);
        } catch (Exception e) {
            throw new RuntimeException("seed failed: " + sql, e);
        }
    }
}

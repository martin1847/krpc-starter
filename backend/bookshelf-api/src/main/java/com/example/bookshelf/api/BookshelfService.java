package com.example.bookshelf.api;

import tech.krpc.annotation.RpcService;
import tech.krpc.annotation.UnsafeWeb;
import tech.krpc.model.RpcResult;
import jakarta.validation.Valid;

import com.example.bookshelf.api.dto.GetBookReq;
import com.example.bookshelf.api.dto.BookDetail;
import com.example.bookshelf.api.dto.ListBooksReq;
import com.example.bookshelf.api.dto.BookListResult;
import com.example.bookshelf.api.dto.BookCountResult;

/**
 * Bookshelf contract — the whole-stack single source of truth for this domain.
 *
 * <p>krpc contract rules (the five that bite first):
 * <ol>
 *   <li>Every method is {@code RpcResult<Dto> m(OneDto)} or {@code m()} — the return type MUST be
 *       {@code RpcResult<…>} and there is at most ONE parameter. Break either and krpc silently
 *       drops the method (no startup error). Merge multiple inputs into one request DTO.</li>
 *   <li>Validate the request DTO with jakarta.validation ({@code @Valid} + {@code @NotBlank} …).</li>
 *   <li>This interface is the generation source for the TS client — editing it edits the
 *       whole-stack contract. The gradle project path segment (Bookshelf, dropping the "Service"
 *       suffix) is the HTTP path: {@code POST {base}/Bookshelf/getBook}.</li>
 * </ol>
 *
 * <p>{@code @UnsafeWeb} (TYPE level) drops the hidden '-' prefix so browsers/frontend can call this
 * service directly over the HTTP gateway. Without it the service stays server-to-server only. This
 * is a public read-only demo with no auth; a real edge service gates writes behind
 * {@code @UnsafeWeb(requireCredential=true)} / a gateway.
 *
 * <p><b>MCP tool surface</b> = the explicit METHOD subset marked {@code @UnsafeWeb.AgentTool}
 * ({@code getBook} + {@code listBooks}), NOT the whole interface. With {@code KRPC_MCP=true} the
 * server exposes {@code POST /mcp} (tools/list, tools/call); only the two annotated methods appear
 * as tools — {@code countBooks} does not. This is how you hand an LLM a curated, safe subset.
 */
@UnsafeWeb
@RpcService
public interface BookshelfService {

    /** Get one book by id. Soft errors: bad id → INVALID_ARGUMENT, missing → NOT_FOUND. */
    @UnsafeWeb.AgentTool
    RpcResult<BookDetail> getBook(@Valid GetBookReq req);

    /** List books, optionally filtered by author substring. Empty list is a valid OK result. */
    @UnsafeWeb.AgentTool
    RpcResult<BookListResult> listBooks(@Valid ListBooksReq req);

    /**
     * Total book count. Deliberately NOT an {@code @UnsafeWeb.AgentTool}: it proves the MCP tool
     * surface is the annotated subset (2 tools), not every web-reachable method (3).
     */
    RpcResult<BookCountResult> countBooks();
}

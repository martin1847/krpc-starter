package com.example.bookshelf.api.dto;

import tech.krpc.annotation.Doc;
import jakarta.validation.constraints.NotBlank;

/** Request for {@code getBook}: a single required book id. */
public class GetBookReq {

    @Doc("Book id (String carries a big integer) / 图书 ID（String 承载大整数）")
    @NotBlank
    private String bookId;

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
}

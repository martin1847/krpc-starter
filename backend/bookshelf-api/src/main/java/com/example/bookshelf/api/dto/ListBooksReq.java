package com.example.bookshelf.api.dto;

import tech.krpc.annotation.Doc;
import jakarta.validation.constraints.Size;

/** Request for {@code listBooks}: an optional case-insensitive author-substring filter. */
public class ListBooksReq {

    @Doc("Optional author substring filter (case-insensitive; null/blank = all books) "
            + "/ 可选作者子串过滤（不区分大小写；null/空 = 全部）")
    @Size(max = 100)
    private String authorContains;

    public String getAuthorContains() { return authorContains; }
    public void setAuthorContains(String authorContains) { this.authorContains = authorContains; }
}

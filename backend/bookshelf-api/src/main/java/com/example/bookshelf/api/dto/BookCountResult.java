package com.example.bookshelf.api.dto;

import tech.krpc.annotation.Doc;

/** Response for {@code countBooks}: total number of books. */
public class BookCountResult {

    @Doc("Total number of books / 图书总数")
    private Integer total;

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
}

package com.example.bookshelf.api.dto;

import java.util.List;

import tech.krpc.annotation.Doc;

/** Response for {@code listBooks}. An empty list is a valid OK result (not NOT_FOUND). */
public class BookListResult {

    @Doc("Books (ordered by title) / 图书列表（按书名排序）")
    private List<BookDetail> list;

    public List<BookDetail> getList() { return list; }
    public void setList(List<BookDetail> list) { this.list = list; }
}

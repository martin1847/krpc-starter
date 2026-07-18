package com.example.bookshelf.api.dto;

import tech.krpc.annotation.Doc;

/**
 * Book response DTO (mirrors the {@code book} table).
 *
 * <p>Response DTOs carry no validation annotations. Every scalar field is a BOXED type
 * (Integer / not int): krpc serializes JSON as NON_NULL, so a primitive would serialize its
 * zero-value and destroy the "absent vs zero" distinction. The {@code @Doc} text is bilingual
 * (English / 中文) and flows into both the generated TS client and the MCP tool schema.
 */
public class BookDetail {

    @Doc("Book id (String carries a big integer) / 图书 ID（String 承载大整数）")
    private String bookId;

    @Doc("Title / 书名")
    private String title;

    @Doc("Author / 作者")
    private String author;

    @Doc("ISBN-13 / 国际标准书号")
    private String isbn;

    /**
     * Money as integer minor units (cents), never a float. This is the field the fitness gate
     * watches: change it to {@code double price} and the ArchUnit money law goes red.
     */
    @Doc("Price in integer cents (minor units; never a float) / 价格，单位：分（整数分，禁止浮点）")
    private Integer priceCents;

    @Doc("Publication year / 出版年份")
    private Integer publishedYear;

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public Integer getPriceCents() { return priceCents; }
    public void setPriceCents(Integer priceCents) { this.priceCents = priceCents; }
    public Integer getPublishedYear() { return publishedYear; }
    public void setPublishedYear(Integer publishedYear) { this.publishedYear = publishedYear; }
}

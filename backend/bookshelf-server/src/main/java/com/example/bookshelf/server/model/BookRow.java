package com.example.bookshelf.server.model;

/**
 * Persistence row for the {@code book} table. Internal to the server — never crosses the contract
 * (mapped to {@link com.example.bookshelf.api.dto.BookDetail} by hand in the impl). MyBatis maps
 * snake_case columns to these camelCase fields (mapUnderscoreToCamelCase=true).
 */
public class BookRow {

    private Long id;
    private String title;
    private String author;
    private String isbn;
    private Integer priceCents;
    private Integer publishedYear;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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

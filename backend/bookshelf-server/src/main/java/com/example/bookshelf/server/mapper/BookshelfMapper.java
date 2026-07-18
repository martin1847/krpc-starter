package com.example.bookshelf.server.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.example.bookshelf.server.model.BookRow;

/**
 * Bookshelf persistence mapping (read-only over the {@code book} table).
 *
 * <p>ext-mybatis scans this interface via mybatis-config.xml's {@code <mappers><package>} so it is
 * directly {@code @Inject}-able — no {@code @Mapper} needed. SQL lives in
 * {@code src/main/resources/mapper/BookshelfMapper.xml} (namespace = this interface's FQN).
 */
public interface BookshelfMapper {

    /** Get one book by id; null when absent. */
    BookRow getBook(@Param("id") Long id);

    /** List books; optional case-insensitive author-substring filter (null = all). Ordered by title. */
    List<BookRow> listBooks(@Param("authorContains") String authorContains);

    /** Total number of books. */
    long countBooks();
}

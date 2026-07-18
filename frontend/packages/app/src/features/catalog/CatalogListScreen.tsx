import { View, Text } from 'react-native';
import { centsToMajor } from '@krpc-starter/core';
import { useBooks } from './hooks';
import { colors } from '../theme';
import { ChevronRightIcon } from '../_components/icons';
import { ScrollScreen, Card, Tag, HintText } from '../../ui';

export interface CatalogListScreenProps {
  /** Open the detail template for a book. Injected by the platform shell. */
  onOpenItem: (id: string) => void;
}

/**
 * List template: renders the seeded books from the generated Bookshelf client (via
 * `@krpc-starter/api`) with the DS primitives (Card / Tag) + core money formatting. Needs the local
 * backend running (see README); the Home tab's Hello demo is the zero-backend fallback.
 */
export function CatalogListScreen({ onOpenItem }: CatalogListScreenProps) {
  const { data, isLoading, isError, error } = useBooks();
  const books = data?.list ?? [];

  return (
    <ScrollScreen contentContainerClassName="px-4 pb-24 pt-4">
      <Text className="mb-3 text-xl font-bold text-ink">Bookshelf</Text>

      {isLoading && <HintText>Loading books...</HintText>}
      {isError && (
        <HintText>Could not load books: {(error as Error).message}. Is the backend running?</HintText>
      )}
      {!isLoading && !isError && books.length === 0 && <HintText>No books yet.</HintText>}

      <View className="gap-3">
        {books.map((book) => (
          <Card
            key={book.bookId}
            onPress={() => onOpenItem(book.bookId)}
            className="flex-row items-center p-4"
            testID={`catalog-item-${book.bookId}`}
          >
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-ink" numberOfLines={1}>
                  {book.title}
                </Text>
                <Tag>{String(book.publishedYear)}</Tag>
              </View>
              <Text className="mt-1 text-xs text-ink-muted" numberOfLines={1}>
                {book.author}
              </Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-base font-semibold text-ink">${centsToMajor(book.priceCents)}</Text>
              <ChevronRightIcon size={16} color={colors.inkMuted} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}

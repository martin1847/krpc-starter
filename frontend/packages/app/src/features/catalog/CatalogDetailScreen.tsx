import { View, Text, Pressable } from 'react-native';
import { centsToMajor } from '@krpc-starter/core';
import { useBook } from './hooks';
import { colors } from '../theme';
import { ChevronLeftIcon } from '../_components/icons';
import { Screen, ScrollScreen, Card, Tag, Divider, Button, HintText } from '../../ui';

export interface CatalogDetailScreenProps {
  itemId: string;
  /** Navigate back. Injected by the platform shell. */
  onBack: () => void;
}

/**
 * Detail template: fetches one book by id from the generated Bookshelf client and lays it out with
 * the DS primitives. A missing id resolves a non-OK envelope -> the query's error state. Header back
 * button + a sticky-style action button demonstrate a typical detail screen.
 */
export function CatalogDetailScreen({ itemId, onBack }: CatalogDetailScreenProps) {
  const { data: book, isLoading, isError, error } = useBook(itemId);

  return (
    <Screen className="bg-detail-bg">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-4">
        <Pressable onPress={onBack} hitSlop={8} testID="detail-back">
          <ChevronLeftIcon size={24} color={colors.ink} />
        </Pressable>
        <Text className="text-lg font-semibold text-ink">Detail</Text>
      </View>

      {isLoading ? (
        <HintText>Loading...</HintText>
      ) : isError ? (
        <HintText>Could not load book: {(error as Error).message}.</HintText>
      ) : !book ? (
        <HintText>Book not found.</HintText>
      ) : (
        <ScrollScreen className="bg-detail-bg" contentContainerClassName="px-4 pb-28 pt-2">
          <Card className="p-5">
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-xl font-bold text-ink">{book.title}</Text>
              <Tag>{String(book.publishedYear)}</Tag>
            </View>
            <Text className="mt-1 text-sm text-ink-muted">{book.author}</Text>
            <Divider className="my-4" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-ink-muted">ISBN</Text>
              <Text className="text-sm text-ink">{book.isbn}</Text>
            </View>
            <Divider className="my-4" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-ink-muted">Price</Text>
              <Text className="text-lg font-semibold text-ink">${centsToMajor(book.priceCents)}</Text>
            </View>
          </Card>

          <Button className="mt-6 py-3.5" onPress={onBack} testID="detail-primary">
            Back to list
          </Button>
        </ScrollScreen>
      )}
    </Screen>
  );
}

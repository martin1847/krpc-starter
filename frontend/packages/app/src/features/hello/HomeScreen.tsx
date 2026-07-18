import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { formatTimestamp } from '@krpc-starter/core';
import { RpcError } from '@krpc-starter/api';
import { useHello } from './hooks';
import { colors } from '../theme';
import { BrandGradient } from '../_components/BrandGradient';
import { ChevronRightIcon } from '../_components/icons';
import { ScrollScreen, Card, Button, HintText, Tag, Divider } from '../../ui';

export interface HomeScreenProps {
  /** Navigate to the catalog list template. Injected by the platform shell (web / mobile). */
  onOpenCatalog: () => void;
}

/**
 * Home screen — a live HelloService.hello call against the krpc sandbox (demo.krpc.tech).
 * Type a name, tap "Say hello", and the unwrapped RpcResult payload (message + server timestamp)
 * renders below. Errors surface via the query's error state.
 */
export function HomeScreen({ onOpenCatalog }: HomeScreenProps) {
  const [input, setInput] = useState('world');
  const [name, setName] = useState('world');
  const hello = useHello(name);

  return (
    <ScrollScreen contentContainerClassName="pb-24">
      <BrandGradient className="px-5 pb-12 pt-14">
        <Text className="text-2xl font-bold text-white">krpc Front Starter</Text>
        <Text className="mt-2 text-sm text-white/85">React Native · Web · iOS · Android</Text>
        <Text className="mt-1 text-xs text-white/70">HelloService via demo.krpc.tech</Text>
      </BrandGradient>

      {/* Call form */}
      <Card className="-mt-6 mx-4 p-4">
        <Text className="text-sm font-semibold text-ink">Call HelloService.hello</Text>
        <View className="mt-3 flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-full border border-line bg-bg px-4 py-2 text-sm text-ink"
            value={input}
            onChangeText={setInput}
            placeholder="your name"
            placeholderTextColor={colors.inkMuted}
            autoCapitalize="none"
            testID="hello-name-input"
          />
          <Button
            className="px-5 py-2.5"
            onPress={() => setName(input.trim())}
            loading={hello.isFetching}
            testID="hello-submit"
          >
            Say hello
          </Button>
        </View>
      </Card>

      {/* Result */}
      <View className="mt-4 px-4">
        {hello.isPending && <HintText className="py-10">Calling demo.krpc.tech…</HintText>}

        {hello.isError && (
          <Card className="p-4">
            <Tag className="bg-badge-sale/10 self-start px-2 py-0.5" textClassName="text-xs text-badge-sale">
              {hello.error instanceof RpcError ? `code ${hello.error.code}` : 'error'}
            </Tag>
            <HintText className="py-3" testID="hello-error">
              {hello.error.message}
            </HintText>
          </Card>
        )}

        {hello.data && (
          <Card className="p-4" testID="hello-result">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-ink">Response</Text>
              <Tag>code 0 · OK</Tag>
            </View>
            <Divider className="my-3" />
            <Text className="text-lg text-ink" testID="hello-message">
              {hello.data.message}
            </Text>
            <Text className="mt-2 text-xs text-ink-muted">
              server time: {formatTimestamp(hello.data.timestamp)}
            </Text>
          </Card>
        )}
      </View>

      {/* Catalog template link */}
      <View className="mt-6 px-4">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Templates</Text>
        <Card onPress={onOpenCatalog} className="flex-row items-center justify-between p-4" testID="open-catalog">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-ink">Catalog list / detail</Text>
            <Text className="mt-1 text-xs text-ink-muted">
              List + detail screens built from the DS primitives (local mock data).
            </Text>
          </View>
          <ChevronRightIcon size={18} color={colors.inkMuted} />
        </Card>
      </View>
    </ScrollScreen>
  );
}

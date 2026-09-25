import { ReactNode, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

export function useColumns(wide = 3, narrow = 2) {
  const { width } = useWindowDimensions();
  return width >= 980 ? wide : narrow;
}

export function TileGrid<T>({
  items,
  render,
  wide = 3,
  narrow = 2,
}: {
  items: T[];
  render: (item: T) => ReactNode;
  wide?: number;
  narrow?: number;
}) {
  const columns = useColumns(wide, narrow);
  const rows = useMemo(() => {
    const next: T[][] = [];
    for (let index = 0; index < items.length; index += columns) next.push(items.slice(index, index + columns));
    return next;
  }, [items, columns]);

  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row-reverse', gap: 12, alignItems: 'stretch' }}>
          {row.map((item, index) => (
            <View key={index} style={{ flex: 1 }}>
              {render(item)}
            </View>
          ))}
          {Array.from({ length: columns - row.length }).map((_, index) => (
            <View key={`pad-${rowIndex}-${index}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

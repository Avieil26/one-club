/** Sum the same player quotes shown on screen; missing prices never become zero. */
export function pricePointsItems(items: { id: string; count: number }[], priceFor: (id: string) => number | undefined) {
  const lines = items.map((item) => {
    const quote = priceFor(item.id);
    const unit = Number.isSafeInteger(quote) && quote! > 0 ? quote! : null;
    return { unit, total: unit === null ? null : unit * item.count };
  });
  return { lines, total: lines.every((line) => line.total !== null) ? lines.reduce((sum, line) => sum + line.total!, 0) : null };
}

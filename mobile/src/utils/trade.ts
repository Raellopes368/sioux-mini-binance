export function calculateBtcFromBrl(brlAmount: number, btcPrice: number): number {
  if (btcPrice <= 0) {
    return 0;
  }
  return brlAmount / btcPrice;
}

export function calculateBrlFromBtc(btcAmount: number, btcPrice: number): number {
  return btcAmount * btcPrice;
}

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}

export function formatBTC(value: number, fractionDigits = 8): string {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
  return `${formatted} BTC`;
}

export function formatBTCAmount(value: number, fractionDigits = 8): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${percentFormatter.format(value)}%`;
}

export function parseBRLInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return 0;
  }
  return Number(digits) / 100;
}

export function formatBRLInput(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

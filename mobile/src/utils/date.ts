const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatTransactionDate(
  isoDate: string,
  now = new Date(),
): string {
  const date = new Date(isoDate);
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const target = startOfDay(date);

  const time = timeFormatter.format(date);

  if (target.getTime() === today.getTime()) {
    return `Hoje, ${time}`;
  }

  if (target.getTime() === yesterday.getTime()) {
    return `Ontem, ${time}`;
  }

  return dateTimeFormatter.format(date);
}

export function formatFullDate(isoDate: string): string {
  return fullDateFormatter.format(new Date(isoDate));
}

export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

export const colors = {
  background: "#090E0C",
  backgroundSecondary: "#0D1512",
  card: "#121C18",
  cardElevated: "#17231E",
  primary: "#00E676",
  primaryPressed: "#00C968",
  primarySoft: "#0C2A1C",
  textPrimary: "#F5F7F6",
  textSecondary: "#9AA8A1",
  textMuted: "#65736C",
  border: "#233129",
  error: "#FF5C5C",
  warning: "#FFB547",
  bitcoin: "#F7931A",
} as const;

export type AppColor = (typeof colors)[keyof typeof colors];

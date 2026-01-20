import { formatUnits } from "viem";

export const formatDuration = (seconds: number) => {
  const pad = (num: number) => (num < 10 ? "0" + num : num);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours > 0 ? pad(hours) + ":" : ""}${pad(minutes)}:${pad(secs)}`;
};

export const formatAmount = (value?: bigint | null) => {
  if (value === null || value === undefined) return "--";
  const [whole, fraction = ""] = formatUnits(value, 18).split(".");
  const trimmed = fraction.slice(0, 4);
  return trimmed ? `${whole}.${trimmed}` : whole;
};

export const formatAmountWithDecimals = (value?: bigint, decimals = 18) => {
  if (value === null || value === undefined) return "--";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, 4);
  return trimmed ? `${whole}.${trimmed}` : whole;
};

export const shortAddress = (value?: string) => {
  if (!value) return "--";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

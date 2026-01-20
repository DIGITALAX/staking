export type BadgeInfo = {
  name: string;
  image: string;
  color: string;
};

export type PoolKind = "mona" | "nft";

export type PoolConfig = {
  id: string;
  nameKey: string;
  name: string;
  shortName?: string;
  description: string;
  chainId: number;
  chainLabel: string;
  stakingAddress: `0x${string}`;
  kind: PoolKind;
  rewardLabel: string;
  subgraphKey: "eth" | "poly";
};

export type ScanProps = {
  dict: any;
  selectedPanel: number;
  onPanelSelect: (index: number) => void;
};

export type RewindProps = {
  row: string;
  scale?: string;
  limitValue: number;
  currentValue: number;
  handleValueChange?: (value: number) => void;
};

export type RecordProps = {
  index: number;
  recordImage: string;
};

export type BadgeProps = {
  index: number;
  badgeInfo: BadgeInfo;
};

export type BoxProps = {
  image: string;
  row: string;
  col: string;
  self: string;
  justify: string;
  contain?: boolean;
  bgColor?: boolean;
  rounded?: boolean;
  border?: boolean;
};

export type TransferItem = {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  blockNumber: bigint;
};

export type MonaStats = {
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: bigint;
  availableToMint?: bigint;
  freezeCap?: boolean;
  cap?: bigint;
  transfers?: TransferItem[];
};

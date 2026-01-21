import ERC20 from "./ERC20.json";
import ERC721 from "./ERC721.json";
import MONA from "./MONA.json";
import MonaStaking from "./MonaStaking.json";
import NFTStaking from "./NFTStaking.json";
import Portal from "./Portal.json";

export const ABIS = {
  ERC20,
  ERC721,
  MONA,
  MonaStaking,
  NFTStaking,
  Portal,
} as const;

export const getABI = (contractName: keyof typeof ABIS) => {
  return ABIS[contractName];
};

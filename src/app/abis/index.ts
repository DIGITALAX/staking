import ERC20 from "./ERC20.json";
import ERC721 from "./ERC721.json";
import MONA from "./MONA.json";
import MonaStaking from "./MonaStaking.json";
import NFTStaking from "./NFTStaking.json";
import Portal from "./Portal.json";
import MatroidGlobalStakingPool from "./MatroidGlobalStakingPool.json";
import MatroidProjectStakingPool from "./MatroidProjectStakingPool.json";
import MatroidProjectNFTStakingPool from "./MatroidProjectNFTStakingPool.json";

export const ABIS = {
  ERC20,
  ERC721,
  MONA,
  MonaStaking,
  NFTStaking,
  Portal,
  MatroidGlobalStakingPool,
  MatroidProjectStakingPool,
  MatroidProjectNFTStakingPool,
} as const;

export const getABI = (contractName: keyof typeof ABIS) => {
  return ABIS[contractName];
};

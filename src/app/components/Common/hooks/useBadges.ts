import { useState } from "react";
import { BadgeInfo } from "../types/common.types";

const useBadges = () => {
  const totalPages: number = 2;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const badgeInfo: BadgeInfo[] = [
    {
      name: "gpu",
      image: "Qmdt7sijfg9asAHbcJLvFCieaspxosAV9QJskT2rKPHhNz",
      color: "record1",
    },
    {
      name: "collector",
      image: "Qmd2q57GCci7DV8HTdT66D4bqhuyptHYehYa5UnxfcTjuA",
      color: "record2",
    },
    {
      name: "critique",
      image: "QmUGp8UDeARbmqCjHJnGP72q7GAddiKcj2NdTJqbM4DNBY",
      color: "record3",
    },
    {
      name: "creative",
      image: "QmedQ8w5WjSX5aKqdLAKywuwsThpR1dDb6bnLynpH4bh5d",
      color: "record4",
    },
    {
      name: "fashion",
      image: "QmeHxDgvWG4gXpUc5oBCPnkHFYRcswffaUEqyMRwiUJJkT",
      color: "record5",
    },
    {
      name: "synth",
      image: "QmWa2nzAUy9dn6xZHE4kFeX2A3gNsNL2oh76gmxypGMqNt",
      color: "record6",
    },
    {
      name: "generative",
      image: "QmPWirsvrp1arB2QKH2uMbnjrenEsWXDsBSBSa83jLSKqG",
      color: "record7",
    },
    {
      name: "stunning",
      image: "QmR9qx5CxbSbTDMNyUXCsEZd49aB8mK4cXcWNpKCPuAwdA",
      color: "record8",
    },
    {
      name: "viral",
      image: "QmV9vLf5mu3XGZ5ZdbKg765Z2b7F1WkEFGSEiwreaHsDj6",
      color: "record9",
    },
    {
      name: "draft master",
      image: "QmeFv3m9SG7ELeoHwLMaFyCtLne68BpMkKYMjzqShaGjfn",
      color: "record10",
    },
    {
      name: "hot",
      image: "Qmc7QWS3PfRQBjqQrTRHAvo716PLENsvRVMADchbC6eePs",
      color: "record11",
    },
    {
      name: "trending",
      image: "Qmejk9taYW3qY98GMEhu9NjFbQDfQhM6549a5agE4foM3T",
      color: "record12",
    },
    {
      name: "merchant",
      image: "QmaJ4w7MWYmz2GCe6aSjesa5HEtgxLrDZuLcqu3rmpCMFC",
      color: "record13",
    },
    {
      name: "top weekly",
      image: "QmXLaMBkLNyBey8fQ9fCrsQdMkezS3E4jM4CEpNhy4Jaid",
      color: "record14",
    },
    {
      name: "top monthly",
      image: "QmQX9Y77E5kPVoipczoUUR2jqeYsAcnTBRCH4wKTsewoMU",
      color: "record15",
    },
  ];

  const records: string[] = [
    "QmbA48L728fSqPDnC48GG4UYHdVGzsLriowFsRoSLHV54p",
    "Qmc1pxgedArguNpjKAXmWhJHDpnwELBC7SRPbi1fn831Ev",
    "QmTvEJGC92Ec2uzNBoJcQqN5DmJ8ppfMTcQqV3D1y4CXh5",
    "QmeLCCxARTVfpSB1PX1kQCvHg3egD649L39j1SeYCDu7MU",
    "QmdjquvPR3j8xnfhT7Gt2QjspKgWVyG9hxodvqqFTSWpp7",
    "QmNVojSQ5NmrVvdWLMZmMpuMkvPtv854Xu4zn33pGvTxnu",
    "QmRYqHi8pshFk2VaeEpEWFtJsyjQCy18CcPVNhHK5kTJwY",
    "QmWBoyMqxNfjHvroX19iHA5wq85Kbvg4AF7T3HASpwBeGS",
    "QmWJVF1ez8wffZV7Gz4A1BZDs87FVHLXVkeaS8615sL4hT",
    "QmTbz6CKqx5m32BRhW1Kf9JxVHDwYov7xxm4pKSMAjZGGx",
    "Qmc5MEdCHbCaQp9JjzwAzd4aEKToHqeHy65pqsUJCo5c9d",
    "QmP2eVT8z3jDfikPVmZoGAhk8qWs6qwtSEwMzc4Mht98fE",
    "QmbXTFYEpiEGFFQdPnvWTGbXPtSwZ6sfWM73P7db67dfV5",
    "QmNXkEoj6oCTURV31sVfxsYEGdU9b2bRyJWTHAMktzpyvp",
    "QmbnsKepJHu3i4FLcygcmEbEd5h3a9hgbuq8QcCeN7aE98",
  ];

  const handlePageIncrease = (e: number): void => {
    if (e < totalPages) {
      setCurrentPage(e + 1);
    }
  };

  const handlePageDecrease = (e: number): void => {
    if (e > 0) {
      setCurrentPage(e - 1);
    }
  };

  return {
    badgeInfo,
    records,
    totalPages,
    currentPage,
    handlePageDecrease,
    handlePageIncrease,
  };
};

export default useBadges;

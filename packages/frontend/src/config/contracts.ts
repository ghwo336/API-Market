import { ApiMarketEscrowAbi } from "@apimarket/shared";

export const ESCROW_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const escrowConfig = {
  address: ESCROW_ADDRESS,
  abi: ApiMarketEscrowAbi,
} as const;

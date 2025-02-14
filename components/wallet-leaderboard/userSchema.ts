import { z } from "zod";

export enum UserStatus {
  "active" = "active",
  "inactive" = "inactive",
}

export const HoldingSchema = z.object({
  mintAddress: z.string().trim().optional(),
  tokenAddress: z.string().trim().optional(),
  amount: z.number().optional(),
  decimals: z.number().optional(),
  usdValue: z.number().optional(),
  name: z.string().trim().optional(),
  symbol: z.string().trim().optional(),
  logo: z.string().nullable().optional(),
  cid: z.string().trim().nullable().optional(),
  collectionName: z.string().trim().optional(),
  collectionLogo: z.string().nullable().optional(),
  isNft: z.boolean().optional(),
});

export const UserSchema = z.object({
  _id: z.string().trim(),

  username: z.string().trim(),

  walletAddress: z.string().trim().optional(),

  phone: z.string().trim().min(8).optional(),

  holdings: z.array(HoldingSchema).nullable().optional(),

  totalValue: z.number().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

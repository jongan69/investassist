import { SOL_MINT } from "../utils/constants";
import { fetchJupiterSwap } from "./fetchJupiterSwap";

export async function fetchSolPrice() {
  const data = await fetchJupiterSwap(SOL_MINT);
  if (!data) return null;
  
  console.log(data);
  return data.data[SOL_MINT].price;
}
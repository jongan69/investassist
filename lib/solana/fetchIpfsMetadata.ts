import { DEFAULT_IMAGE_URL } from "@/lib/solana/constants";
export const fetchIpfsMetadata = async (cid: string) => {
  try {
    if (!cid) {
      return { imageUrl: DEFAULT_IMAGE_URL };
    }
    try {
      const response = await fetch(`/api/get-ipfs-proxy?cid=${cid}`);
      if (!response.ok) return { imageUrl: DEFAULT_IMAGE_URL };
      return await response.json();
    } catch (error) {
      console.error("Error Fetching IPFS Data Using Default:", DEFAULT_IMAGE_URL);
      return { imageUrl: DEFAULT_IMAGE_URL };
    }
  } catch (error) {
    console.error("Error Fetching IPFS Data:", error);
    return { imageUrl: DEFAULT_IMAGE_URL };
  }
};
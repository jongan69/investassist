import { DEFAULT_IMAGE_URL } from "@/lib/solana/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cid = url.searchParams.get('cid');
  if (!cid) {
    console.error(`CID is required`);
    return Response.json({ imageUrl: DEFAULT_IMAGE_URL });
  }

  const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;

  try {
    const response = await fetch(ipfsUrl, { mode: 'no-cors' });
    if (!response.ok) {
      console.error(`Error fetching IPFS data: ${JSON.stringify(response)}`);
      return Response.json({ imageUrl: DEFAULT_IMAGE_URL });
    }
    const data = await response.json();
    return Response.json({ imageUrl: data.image });
  } catch (error) {
    console.error(`Error fetching IPFS data: ${error}`);
    return Response.json({ imageUrl: DEFAULT_IMAGE_URL });
  }
}
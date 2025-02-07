// app/api/get-ipfs-proxy/route.ts
const DEFAULT_IMAGE_URL =
  process.env.UNKNOWN_IMAGE_URL ||
  "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png";

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
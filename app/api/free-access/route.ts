import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { walletAddress } = await req.json();

        // Validate that at least one search parameter is provided
        if (!walletAddress) {
            return NextResponse.json(
                { error: "Either username or walletAddress must be provided" },
                { status: 400 }
            );
        }
        const freeAccessAddresses = await fetch('https://soltrendio.com/api/holders/getHolders');
        const freeAccessAddressesJson = await freeAccessAddresses.json();
        const freeAccessAddressesArray = freeAccessAddressesJson.UniqueNftHoldersAndStakers;
        const isFreeAccess = freeAccessAddressesArray.includes(walletAddress);
        
        return NextResponse.json({ isFreeAccess }, { status: 200 });
    } catch (error) {
        console.error("Error finding profile:", error)
        return NextResponse.json({ error: "Failed to find profile" }, { status: 500 });
    }
}
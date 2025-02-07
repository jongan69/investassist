import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function POST(req: Request) {
    try {
        const { username, walletAddress } = await req.json();

        // Validate that at least one search parameter is provided
        if (!username && !walletAddress) {
            return NextResponse.json(
                { error: "Either username or walletAddress must be provided" },
                { status: 400 }
            );
        }

        const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
        await mongoClient.connect();

        const db = mongoClient.db("investassist");
        const collection = db.collection("profiles");

        // Create query object based on provided parameters
        const query = username ? { username } : { walletAddress };
        const profile = await collection.findOne(query);
        if (profile) {
            return NextResponse.json({ exists: true, profile }, { status: 200 });
        } else {
            return NextResponse.json({ exists: false }, { status: 200 });
        }
    } catch (error) {
        console.error("Error finding profile:", error)
        return NextResponse.json({ error: "Failed to find profile" }, { status: 500 });
    }
}
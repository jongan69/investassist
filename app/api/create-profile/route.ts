import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function POST(req: Request) {
    try {
        const { username, walletAddress, holdings, totalValue } = await req.json();

        const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
        await mongoClient.connect();

        const db = mongoClient.db("investassist");
        const collection = db.collection("profiles");

        const profile = await collection.findOne({ username });
        if (profile) {
            return NextResponse.json({ error: "Profile already exists" }, { status: 400 });
        }

        await collection.insertOne({ username, walletAddress, holdings, totalValue });

        return NextResponse.json({ message: "Profile created successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error creating profile:", error)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }
}
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongo/connect";

export async function GET(req: Request) {
    try {
        const client = await clientPromise; 

        const db = client.db("investassist");
        const collection = db.collection("profiles");

        const leaderboard = await collection.find({}).sort({ totalProfit: -1 }).limit(100).toArray();
        return NextResponse.json({ leaderboard }, { status: 200 });
    } catch (error) {
        console.error("Error finding profile:", error)
        return NextResponse.json({ error: "Failed to find profile" }, { status: 500 });
    }
}
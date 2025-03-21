import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongo/connect"

export async function POST(req: Request) {
    const { username, walletAddress } = await req.json();

    // Validate input
    if (!username || !walletAddress) {
        return NextResponse.json(
            { error: "Username and wallet address are required" },
            { status: 400 }
        );
    }

    try {
        // Check if investment plan is not too large (16MB is MongoDB's document size limit)
        const planSize = JSON.stringify(walletAddress).length;
        if (planSize > 16000000) { // Leave some room for other fields
            return NextResponse.json(
                { error: "Investment plan is too large" },
                { status: 413 }
            );
        }

        const client = await clientPromise;
        const db = client.db("investassist");
        const collection = db.collection("profiles");

        const result = await collection.updateOne(
            { username },
            {
                $set: {
                    walletAddress,
                    lastUpdated: new Date()
                }
            },
            { upsert: true }
        );

        if (!result.acknowledged) {
            throw new Error("MongoDB operation not acknowledged");
        }

        return NextResponse.json({
            message: "Investment plan saved successfully",
            modifiedCount: result.modifiedCount
        }, { status: 200 });
    } catch (error) {
        console.error("Error saving investment plan:", error);
        return NextResponse.json(
            { error: "Failed to save investment plan" },
            { status: 500 }
        );
    }
} 
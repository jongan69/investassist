import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/connect";

export async function POST(req: Request) {
    try {
        const { walletAddress, phoneNumber } = await req.json();

        const client = await clientPromise;
        const db = client.db("investassist");
        const collection = db.collection("profiles");

        const profile = await collection.findOne({ walletAddress });

        if (!profile) {
            return NextResponse.json({ exists: false, message: "Profile not found" }, { status: 404 });
        }

        await collection.updateOne(
            { walletAddress },
            { $set: { phoneNumber } },
            { upsert: true }
        );

        return NextResponse.json({ message: "Phone Number successfully submitted" }, { status: 200 });
    } catch (error) {
        console.error("Error saving phone number:", error);
        return NextResponse.json({ error: "Failed to save phone number" }, { status: 500 });
    }
}

import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function POST(req: Request) {
    try {
        const { username, investmentPlan } = await req.json();

        // Validate input
        if (!username || !investmentPlan) {
            return NextResponse.json(
                { error: "Username and investment plan are required" },
                { status: 400 }
            );
        }

        // Check if investment plan is not too large (16MB is MongoDB's document size limit)
        const planSize = JSON.stringify(investmentPlan).length;
        if (planSize > 16000000) { // Leave some room for other fields
            return NextResponse.json(
                { error: "Investment plan is too large" },
                { status: 413 }
            );
        }

        const mongoClient = new MongoClient(process.env.MONGODB_URI as string, {
            maxIdleTimeMS: 5000, // Close idle connections after 5 seconds
            maxPoolSize: 10      // Limit concurrent connections
        });
        
        await mongoClient.connect();

        try {
            const db = mongoClient.db("investassist");
            const collection = db.collection("profiles");
            
            const result = await collection.updateOne(
                { username }, 
                { 
                    $set: { 
                        investmentPlan,
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
        } finally {
            await mongoClient.close();
        }
    } catch (error) {
        console.error("Error saving investment plan:", error);
        return NextResponse.json(
            { error: "Failed to save investment plan" }, 
            { status: 500 }
        );
    }
}
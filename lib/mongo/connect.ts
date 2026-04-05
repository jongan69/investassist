import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
    if (!uri) {
        throw new Error('Please add your Mongo URI to .env.local');
    }

    if (clientPromise) {
        return clientPromise;
    }

    if (process.env.NODE_ENV === 'development') {
        const globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            globalWithMongo._mongoClientPromise = MongoClient.connect(uri);
        }

        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        const client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }

    return clientPromise;
};
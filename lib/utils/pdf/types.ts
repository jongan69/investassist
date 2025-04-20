export interface Transaction {
    id?: string;
    owner: string;
    asset: string;
    transactionType: string;
    date: string;
    notificationDate: string;
    amount: string;
    hasLargeCapitalGains: boolean;
    details?: string | null;
    ticker?: string | null;
}

export interface PdfDocument {
    id?: string;
    documentUrl: string;
    name: string;
    office: string;
    filingYear: string;
    filingType: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    processedData: {
        transactions: Array<Transaction>;
        summary: {
            status?: string;
            stateDistrict?: string;
            [key: string]: any;
        };
        // insights?: Record<string, any>;
        rawText: string;
        processedAt?: Date;
        error?: string;
    };
    processedAt?: Date;
    error?: string;
}
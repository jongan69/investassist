import { createClient } from '@supabase/supabase-js';
import { Transaction } from './types';


const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function storeNonDuplicateTransactions(transactions: Transaction[]) {
    // Get existing transactions to check for duplicates
    const { data: existingTransactions, error: fetchError } = await supabase
      .from('house-rep-transactions')
      .select('owner, asset, date, notificationDate, amount, hasLargeCapitalGains, details');

    if (fetchError) {
      throw new Error(`Failed to fetch existing transactions: ${fetchError.message}`);
    }

    console.log(`Found ${existingTransactions?.length || 0} existing transactions in database`);

    // Helper function to validate dates
    const isValidDate = (dateStr: string | null | undefined): boolean => {
      if (!dateStr) return false;
      try {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      } catch (e) {
        return false;
      }
    };

    // Helper function to check if a date is in the future
    const isFutureDate = (dateStr: string | null | undefined): boolean => {
      if (!dateStr) return false;
      try {
        const date = new Date(dateStr);
        return date > new Date();
      } catch (e) {
        return false;
      }
    };

    // Helper function to normalize dates for a transaction
    const normalizeTransactionDates = (tx: Transaction): Transaction => {
      const date = tx.date ? new Date(tx.date) : null;
      const notificationDate = tx.notificationDate ? new Date(tx.notificationDate) : null;
      const now = new Date();

      // If both dates are in the future, use current date
      if (date && notificationDate && date > now && notificationDate > now) {
        return {
          ...tx,
          date: now.toISOString().split('T')[0],
          notificationDate: now.toISOString().split('T')[0]
        };
      }

      // If only one date is in the future, use the other date
      if (date && date > now && notificationDate && notificationDate <= now) {
        return {
          ...tx,
          date: notificationDate.toISOString().split('T')[0]
        };
      }

      if (notificationDate && notificationDate > now && date && date <= now) {
        return {
          ...tx,
          notificationDate: date.toISOString().split('T')[0]
        };
      }

      return tx;
    };

    // Filter out transactions with invalid dates and normalize future dates
    const validDateTransactions = transactions
      .filter(tx => isValidDate(tx.date) && isValidDate(tx.notificationDate))
      .map(normalizeTransactionDates);

    console.log(`Filtered out ${transactions.length - validDateTransactions.length} transactions with invalid dates`);

    // Filter out transactions with unknown assets
    const validTransactions = validDateTransactions.filter(tx => 
      tx.asset && 
      tx.asset.toLowerCase() !== 'unknown' && 
      tx.asset.trim() !== ''
    );

    console.log(`Filtered out ${transactions.length - validTransactions.length} transactions with unknown assets`);

    // Create a function to check if two transactions are duplicates
    const isDuplicate = (newTx: Transaction, existingTx: any) => {
      // Helper function to safely parse dates
      const safeParseDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          // Check if date is valid
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0];
        } catch (e) {
          console.warn(`Invalid date value: ${dateStr}`);
          return '';
        }
      };

      // Normalize dates for comparison
      const newDate = safeParseDate(newTx.date);
      const existingDate = safeParseDate(existingTx.date);
      const newNotificationDate = safeParseDate(newTx.notificationDate);
      const existingNotificationDate = safeParseDate(existingTx.notificationDate);

      // console.log(newDate, existingDate, newNotificationDate, existingNotificationDate)
      // Normalize amounts for comparison (remove spaces and $ signs)
      const newAmount = newTx.amount.replace(/[\s$]/g, '');
      const existingAmount = existingTx.amount.replace(/[\s$]/g, '');

      const isDup = (
        newTx.owner.toLowerCase() === existingTx.owner.toLowerCase() &&
        newTx.asset.toLowerCase() === existingTx.asset.toLowerCase() &&
        newDate === existingDate &&
        newNotificationDate === existingNotificationDate &&
        newAmount === existingAmount &&
        newTx.hasLargeCapitalGains === existingTx.hasLargeCapitalGains &&
        (newTx.details ? newTx.details.toLowerCase().trim() : '') === (existingTx.details ? existingTx.details.toLowerCase().trim() : '')
      );
      return isDup;
    };

    // Filter out transactions that already exist
    const newTransactions = validTransactions.filter(newTx => {
      const isDup = existingTransactions?.some(existingTx => isDuplicate(newTx, existingTx));
      return !isDup;
    });

    console.log(`Found ${newTransactions.length} new transactions out of ${transactions.length} total`);

    if (newTransactions.length === 0) {
      console.log('No new transactions to insert');
      return [];
    }

    // Insert only new transactions
    const insertPromises = newTransactions.map((transaction: Transaction) => {
      const insertData = {
        owner: transaction.owner,
        asset: transaction.asset,
        ticker: transaction.ticker,
        transactionType: transaction.transactionType === 'P' ? 'Buy' : 'Sell',
        date: transaction.date ? new Date(transaction.date) : null,
        notificationDate: transaction.notificationDate ? new Date(transaction.notificationDate) : null,
        amount: transaction.amount,
        hasLargeCapitalGains: transaction.hasLargeCapitalGains,
        details: transaction.details
      };

      return supabase
        .from('house-rep-transactions')
        .insert(insertData);
    });

    // Execute all insertions in parallel
    const results = await Promise.all(insertPromises);
    return results;
}


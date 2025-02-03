"use client"
import React, { useState, useEffect } from 'react';
import * as web3 from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { encodeURL, createQR, findReference, FindReferenceError, validateTransfer } from "@solana/pay";
import BigNumber from "bignumber.js";
import QRCode from "react-qr-code";
import { Connection } from '@solana/web3.js';
import { NETWORK } from '@/lib/solana/constants';

const receiverPublicKey = "LockmjYWctcbeQCJt5u5z536xbmeU6n5XeQJhuPWxp2";

const InvestmentPlan = (initialData: any) => {
    const connection = new Connection(NETWORK);
    const [txSig, setTxSig] = useState('');
    const [balance, setBalance] = useState(0);
    const [qrCodeValue, setQrCodeValue] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    // const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    // Generate reference for the payment
    const reference = new web3.Keypair().publicKey;
    const amount = new BigNumber(0.1);
    const label = "Investment Plan Payment";
    const message = "0.1 SOL Investment Plan Payment";
    const memo = "Investment Plan Transfer";

    const createPaymentQR = async () => {
        try {
            const recipientAddress = new web3.PublicKey(receiverPublicKey);
            const url = encodeURL({
                recipient: recipientAddress,
                amount,
                reference,
                label,
                message,
                memo,
            });

            setQrCodeValue(url.toString());
            checkPayment(recipientAddress);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create payment QR code');
        }
    };

    const checkPayment = async (recipientAddress: web3.PublicKey) => {
        setPaymentStatus('pending');
        
        try {
            const { signature } = await new Promise<{ signature: string }>((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 30; // 30 seconds timeout
                
                const interval = setInterval(async () => {
                    try {
                        attempts++;
                        if (attempts > maxAttempts) {
                            clearInterval(interval);
                            reject(new Error('Payment timeout - please try again'));
                            return;
                        }

                        const signatureInfo = await findReference(connection, reference, { 
                            finality: 'confirmed'
                        });
                        
                        clearInterval(interval);
                        resolve({ signature: signatureInfo.signature });
                    } catch (error) {
                        if (!(error instanceof FindReferenceError)) {
                            console.error('Error checking payment:', error);
                            // Only reject for non-FindReference errors if we've exceeded max attempts
                            if (attempts > maxAttempts) {
                                clearInterval(interval);
                                reject(error);
                            }
                        }
                    }
                }, 1000);
            });

            setPaymentStatus('confirmed');
            
            // Add retry logic for validation
            let validationAttempts = 0;
            const maxValidationAttempts = 3;
            
            while (validationAttempts < maxValidationAttempts) {
                try {
                    await validateTransfer(
                        connection,
                        signature,
                        {
                            recipient: recipientAddress,
                            amount,
                        }
                    );
                    
                    setPaymentStatus('validated');
                    setTxSig(signature);
                    toast.success('Payment validated successfully!');
                    
                    // Update balance after successful payment
                    if (publicKey) {
                        const info = await connection.getAccountInfo(publicKey);
                        if (info) {
                            setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
                        }
                    }
                    return;
                } catch (error) {
                    validationAttempts++;
                    if (validationAttempts === maxValidationAttempts) {
                        throw error;
                    }
                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error('Payment failed', error);
            setPaymentStatus('failed');
            toast.error(error instanceof Error ? error.message : 'Payment validation failed');
        }
    };

    useEffect(() => {
        const getInfo = async () => {
            if (connection && publicKey) {
                const info = await connection.getAccountInfo(publicKey);
                if (info) {
                    setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
                } else {
                    setBalance(0); // or handle the null case as needed
                }
            }
        };
        getInfo();
    }, [connection, publicKey]);

    const outputs = [
        {
            title: 'Account Balance...',
            dependency: balance,
        },
        {
            title: 'Transaction Signature...',
            dependency: txSig,
            href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
        },
    ];

    return (
        <main className='min-h-screen text-white max-w-7xl'>
            <section className='grid grid-cols-1 sm:grid-cols-6 gap-4 p-4'>
                <form className='rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                    <div className='flex justify-between items-center'>
                        <h2 className='font-bold text-2xl text-[#fa6ece]'>
                            Purchase Investment Plan
                        </h2>
                        <button
                            onClick={createPaymentQR}
                            type="button"
                            className='bg-[#fa6ece] rounded-lg px-4 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]'
                        >
                            Pay 0.1 SOL
                        </button>
                    </div>

                    {paymentStatus && (
                        <div className={`mt-4 p-3 text-center rounded-lg border ${
                            paymentStatus === 'pending' ? 'bg-yellow-900/30 text-yellow-100 border-yellow-500/30' :
                            paymentStatus === 'confirmed' ? 'bg-[#fa6ece]/30 text-pink-100 border-[#fa6ece]/30' :
                            paymentStatus === 'validated' ? 'bg-green-900/30 text-green-100 border-green-500/30' :
                            paymentStatus === 'failed' ? 'bg-red-900/30 text-red-100 border-red-500/30' : ''
                        }`}>
                            Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                        </div>
                    )}

                    {qrCodeValue && !paymentStatus.includes('validated') && (
                        <div className='flex flex-col items-center mt-4'>
                            <p className='mb-2 text-sm text-gray-300'>Scan this QR code to pay</p>
                            <div className='p-4 bg-white rounded-xl'>
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={qrCodeValue}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>
                    )}

                    <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
                        <ul className='p-2'>
                            {outputs.map(({ title, dependency, href }, index) => (
                                <li key={title} className={`flex justify-between items-center ${index !== 0 && 'mt-4'}`}>
                                    <p className='tracking-wider'>{title}</p>
                                    {dependency &&
                                        <a
                                            href={href}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`flex text-[#80ebff] italic ${href && "hover:text-white"} transition-all duration-200`}
                                        >
                                            {dependency.toString().slice(0, 25)}
                                            {href && <ExternalLinkIcon className='w-5 ml-1' />}
                                        </a>
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default InvestmentPlan;

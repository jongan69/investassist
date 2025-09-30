"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { Replace } from "lucide-react";


export default function JupiterTerminalPopup({ contractAddress, isOpen, setIsOpen, buttonText }: { contractAddress: string, isOpen: boolean, setIsOpen: (isOpen: boolean) => void, buttonText?: string }) {
    const [isJupiterReady, setIsJupiterReady] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);
    // Example: SOL → contractAddress
    const initialInputMint = "So11111111111111111111111111111111111111112"; // SOL mint address
    const initialOutputMint = contractAddress;

    // Move endpoint to a constant for easier configuration
    const JUPITER_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT; // <-- replace with your real endpoint

    // Memoize PublicKey instantiation
    const PLATFORM_FEE_AND_ACCOUNTS = useMemo(() => ({
        referralAccount: new PublicKey("552wiXYmw4HHeLQVFFcrUiwd5FD1XAsiYskLzdv8uiMx"),
        feeBps: 100,
    }), []);

    // Add Jupiter script only if not present, and clean up on unmount
    useEffect(() => {
        let script: HTMLScriptElement | null = null;
        if (!window.Jupiter) {
            if (!document.getElementById("jupiter-terminal-script")) {
                script = document.createElement("script");
                script.src = "https://terminal.jup.ag/main-v3.js";
                script.async = true;
                script.id = "jupiter-terminal-script";
                script.setAttribute("data-preload", "true");

                script.onload = () => {
                    setIsJupiterReady(true);
                };
                script.onerror = () => {
                    console.error("Failed to load Jupiter script");
                };
                document.body.appendChild(script);
            }
        } else {
            setIsJupiterReady(true);
        }
        return () => {
            // Remove script on unmount
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    // Initialize Jupiter terminal when ready and modal is open
    useEffect(() => {
        if (isOpen && isJupiterReady && window.Jupiter) {
            window.Jupiter.init({
                displayMode: "integrated",
                integratedTargetId: "integrated-terminal",
                endpoint: JUPITER_ENDPOINT,
                formProps: {
                    fixedOutputMint: false,
                    initialInputMint,
                    initialOutputMint,
                    swapMode: "ExactOut",
                    initialAmount: "1000000000",
                    strictTokenList: false,
                    platformFeeAndAccounts: PLATFORM_FEE_AND_ACCOUNTS
                },
            });
        }
    }, [isOpen, isJupiterReady, initialInputMint, initialOutputMint, PLATFORM_FEE_AND_ACCOUNTS, JUPITER_ENDPOINT]);

    // Cleanup Jupiter terminal on modal close
    useEffect(() => {
        if (!isOpen) {
            const terminal = document.getElementById("integrated-terminal");
            if (terminal) {
                terminal.innerHTML = "";
            }
        }
    }, [isOpen]);

    // Accessibility: focus trap and Escape key
    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
            // Focus the modal
            modalContentRef.current?.focus();
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    setIsOpen(false);
                }
                // Focus trap
                if (e.key === "Tab" && modalContentRef.current) {
                    const focusableEls = modalContentRef.current.querySelectorAll<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstEl = focusableEls[0];
                    const lastEl = focusableEls[focusableEls.length - 1];
                    if (!e.shiftKey && document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    } else if (e.shiftKey && document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                }
            };
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
                // Restore focus
                previouslyFocusedElement.current?.focus();
            };
        }
    }, [isOpen, setIsOpen]);

    // Click outside to close
    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    }, [setIsOpen]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-extrabold text-lg border border-emerald-900 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400/60 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Open Jupiter Swap"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Replace className="w-5 h-5 text-white dark:text-white/90" aria-hidden="true" />
                    <span>{buttonText || "Open Jupiter Swap"}</span>
                </span>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-2xl transition-all duration-300"
                    onMouseDown={handleBackdropClick}
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="relative flex items-center justify-center w-full h-full">
                        <div
                            ref={modalContentRef}
                            className="relative bg-[#212128] dark:bg-[#212128] rounded-3xl shadow-2xl p-0 sm:p-10 w-full max-w-3xl border border-emerald-200/60 dark:border-emerald-900/60 backdrop-blur-2xl overflow-hidden animate-fade-in flex flex-col items-center justify-center"
                            tabIndex={-1}
                        >
                            <div className="w-full h-[600px] flex items-center justify-center">
                                <div id="integrated-terminal" className="w-full h-full rounded-xl shadow-inner bg-gradient-to-br from-black/90 via-emerald-100/60 to-black/80 dark:from-black/90 dark:via-emerald-900/40 dark:to-black/90 backdrop-blur-xl" />
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="group mt-8 mb-4 px-6 py-3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 dark:from-emerald-700 dark:via-emerald-800 dark:to-emerald-900 text-emerald-900 dark:text-white rounded-full font-bold text-base shadow-lg hover:from-emerald-500 hover:to-emerald-300 hover:shadow-emerald-400/40 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400/60 focus:ring-offset-2 dark:focus:ring-offset-gray-900 relative flex items-center gap-2"
                                aria-label="Close Jupiter Swap"
                            >
                                <svg className="w-5 h-5 text-emerald-900 dark:text-white/90 group-hover:text-emerald-200 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
    
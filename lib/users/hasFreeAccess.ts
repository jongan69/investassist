export async function hasFreeAccess(walletAddress: string) {
    const freeAccess = await fetch('/api/free-access', {
        method: 'POST',
        body: JSON.stringify({ walletAddress })
    });
    const freeAccessJson = await freeAccess.json();
    return freeAccessJson.isFreeAccess;
}
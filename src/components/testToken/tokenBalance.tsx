import { PublicKey } from '@solana/web3.js';
import { connection } from './swapfunction';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import supabase from './database';

interface Token {
    name: string;
    amount: string;
    symbol: string;
    value: string;
    mintAddress: string;
    h24: string;
    imageUrl: string;
}

// Function to fetch token balance and mint address
const getTokenBalanceAndMintAddress = async (walletAddress: string, mintAddress: string) => {
    try {
        const walletPublicKey = new PublicKey(walletAddress);
        const mintPublicKey = new PublicKey(mintAddress);

        // Derive the associated token address (token account for the specified wallet and mint)
        const tokenAccountAddress = await getAssociatedTokenAddress(mintPublicKey, walletPublicKey);

        // Get token account balance
        const tokenAccount = await connection.getParsedAccountInfo(tokenAccountAddress);
        if (!tokenAccount.value) {
            // console.log('Token account does not exist for the specified mint and wallet address');
            return null;
        }

        let balance = 0;
        if ('parsed' in tokenAccount.value.data) {
            balance = tokenAccount.value.data.parsed.info.tokenAmount.uiAmount || 0;
        } else {
            console.log('Token account data is not parsed.');
        }

        console.log(`Token Mint Address: ${mintAddress}`);
        console.log(`Token Account Address: ${tokenAccountAddress.toBase58()}`);
        console.log(`Token Balance: ${balance}`);
        return balance;
    } catch (error) {
        console.error('Error fetching token balance and mint address:', error);
        return null;
    }
};

// Function to fetch the token price
export const getTokenPrice = async (mintAddress: string) => {
    // const options = {
    //     method: 'GET',
    //     headers: {
    //         accept: 'application/json',
    //         'x-chain': 'solana',
    //         'X-API-KEY': '1171a713147b4575aef1bd5a8110b116'
    //     }
    // };

    try {
        console.log(`Price for ${mintAddress} Fetching...`);
        // const res = await fetch(`https://public-api.birdeye.so/defi/price?address=${mintAddress}`, options);
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
        const resJson = await res.json();
        // console.log(data, "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
        const price = resJson.pairs[0].priceUsd;
        const priceChange24h = resJson.pairs[0].priceChange.h24 
        let imageUrl = "";
        // console.log(`Price for ${mintAddress}: ${resJson.pairs[0].priceUsd}`);
        if (mintAddress === "So11111111111111111111111111111111111111112"){
            imageUrl = '/images/solana.svg'
        } else {
            imageUrl = resJson.pairs[0].info.imageUrl || ""
        }
        return {price, priceChange24h, imageUrl} ;
    } catch (err) {
        console.error('Error fetching token price:', err);
        return null;
    }
};

// Function to get tokens and populate with balance and price
export const getTokens = async (userWalletAddress: string) => {
    const tokens: Token[] = [];
    const { data, error } = await supabase.from('meme').select('*');
    let totalValueInSol = 0;

    if (error) {
        console.error('Error fetching token list:', error.message);
        return tokens;
    }

    if (data) {
        const tokenPromises = data.map(async (token) => {
            const balance = await getTokenBalanceAndMintAddress(userWalletAddress, token.mint);
            const price = await getTokenPrice(token.mainMint);
            
            if (balance !== null) {
                tokens.push({
                    mintAddress: token.mint,
                    amount: balance.toFixed(4), 
                    value: (price?.price * balance).toFixed(2) || "0",
                    name: token.name,
                    symbol: token.name,
                    h24: price?.priceChange24h || "0",
                    imageUrl: price?.imageUrl || ""
                });
                if (token.mint === "3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce") {
                    totalValueInSol = price?.price;
                    console.log(price?.price, price?.priceChange24h)
                }
            }
        });

        // Ensure all token balance and price requests complete before returning
        await Promise.all(tokenPromises);
    }

    const totalValue = tokens.reduce((acc, token) => acc + parseFloat(token.value), 0)
    const totalPercentage = tokens.reduce((acc, token) => acc + parseFloat(token.h24), 0)
// console.log(totalValueInSol, totalPercentage)
    return {tokens, totalValue, totalValueInSol, totalPercentage};
};

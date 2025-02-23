import { createAssociatedTokenAccountInstruction, createMint, createTransferInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Connection, Keypair, ParsedAccountData, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import supabase from "./database";

const network = "https://devnet.helius-rpc.com/?api-key=38caa145-8a0a-4499-a141-be31c8f4c784";
export const connection = new Connection(network, 'confirmed');
const Xdegen_wallet = new PublicKey('XdEqt8TDiG6HHxTCdo41FWwxt7qpthK5VWcXQWjthbS');
export const Xdegen_mint = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
const xDegenWalletKeypairString = "[209,174,191,23,162,17,90,120,119,10,162,129,102,112,254,55,34,0,251,151,0,136,148,17,139,179,182,35,175,245,175,98,7,216,102,67,96,114,252,224,248,112,137,241,50,183,197,158,137,134,177,28,46,169,248,74,87,68,83,145,107,153,146,229]";
const xDegenWalletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(xDegenWalletKeypairString))
);


export const claimXSOL = async (
    publicKey: PublicKey,
    amount: number,
) => {
    try {
        // console.log(process.env.NEXT_PUBLIC_CONNECTION)

        const source_wallet = new PublicKey('XdEqt8TDiG6HHxTCdo41FWwxt7qpthK5VWcXQWjthbS');

        const mint = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
        const mint_address = new PublicKey(mint);

        if (!publicKey) {
            alert('Please connect your wallet!');
            return;
        }

        const sourceAccountAta = await getAssociatedTokenAddress(mint_address, source_wallet);
        const destinationAccountAta = await getAssociatedTokenAddress(mint_address, publicKey);

        // Check if the ATAs already exist
        const sourceAccount = await connection.getAccountInfo(sourceAccountAta);
        const destinationAccount = await connection.getAccountInfo(destinationAccountAta);

        const checkDecimals = await connection.getParsedAccountInfo(new PublicKey(mint));
        if (!checkDecimals.value) {
            throw new Error('Token account not found');
        }
        const numberDecimals = (checkDecimals.value.data as ParsedAccountData).parsed.info.decimals as number

        // Create the transfer instruction
        const transferInstruction = createTransferInstruction(
            sourceAccountAta,
            destinationAccountAta,
            source_wallet,  // owner of the source token account
            Math.floor(Number(amount) * Math.pow(10, numberDecimals))  // amount in smallest units (e.g., lamports for SOL)
        );

        // Create a transaction and add the transfer instruction
        const transaction = new Transaction()

        if (!sourceAccount) {
            transaction.add(createAssociatedTokenAccountInstruction(
                source_wallet,
                sourceAccountAta,
                source_wallet,
                mint_address
            ));
        }

        if (!destinationAccount) {
            transaction.add(createAssociatedTokenAccountInstruction(
                source_wallet,
                destinationAccountAta,
                publicKey,
                mint_address
            ));
        }
        transaction.add(transferInstruction);

        transaction.feePayer = source_wallet;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Assuming you have the source wallet's keypair
        if (!xDegenWalletKeypairString) {
            throw new Error('Source wallet keypair not found');
        }
        const sourceWalletKeypair = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(xDegenWalletKeypairString))
        );
        transaction.sign(sourceWalletKeypair);

        const txid = await connection.sendRawTransaction(transaction.serialize());
        const msg = `Transaction sent: ${txid}`;
        return { message: msg };


    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}

export const buy = async (
    sellingMint: string,
    sellingAmount: number,
    userPubKey: PublicKey,
    buyingName: string,
    buyingMint: string,
    buyingAmount: number,
    // sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
) => {

    let findsellingMint: string;
    if (sellingMint === Xdegen_mint) {
        findsellingMint = Xdegen_mint;
    } else {
        findsellingMint = await getMeme(sellingMint)
    }

    if (!findsellingMint) {
        throw new Error('Insuffient Balance7');
    }

    let findbuyingMint: string;
    if (buyingMint === Xdegen_mint) {
        findbuyingMint = Xdegen_mint;
    } else {
        findbuyingMint = await getMeme(buyingMint, buyingName)
    }

    if (!findbuyingMint) {
        throw new Error('Try again');
    }

    const fromUser = await SPLTransfer(
        sellingAmount,
        Xdegen_wallet,
        userPubKey,
        findsellingMint,
        Xdegen_wallet
    )

    const fromXDegen = await SPLTransfer(
        buyingAmount,
        userPubKey,
        Xdegen_wallet,
        findbuyingMint,
        Xdegen_wallet
    )

    const transaction = new Transaction()
    transaction.add(...fromUser)
    transaction.add(...fromXDegen)

    const latestBlockHash = await connection.getLatestBlockhash({ commitment: "confirmed" });
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = Xdegen_wallet;
    transaction.partialSign(xDegenWalletKeypair);
    console.log("transaction")
    // Send the transaction
    // const signature = await sendTransaction(transaction, connection);

    // Confirm the transaction
    // const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    return transaction;
}

export const sell = async (
    xSolAmount: number,
    userPubKey: PublicKey,
    tokenMint: string,
    tokenAmount: number,
    // sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
) => {
    const { data, error } = await supabase
        .from('meme')
        .select()
        .eq('mainMint', tokenMint);

    if (error) {
        console.error(error)
        throw error
    };

    if (data.length === 0) {
        throw new Error('Token not found');
    }
    const Xdegen_tokenMint = data[0].mint;


    const XSOLToUser = await SPLTransfer(
        xSolAmount,
        userPubKey,
        Xdegen_wallet,
        Xdegen_mint,
        Xdegen_wallet
    )

    const tokenToXDegen = await SPLTransfer(
        tokenAmount,
        Xdegen_wallet,
        userPubKey,
        Xdegen_tokenMint,
        Xdegen_wallet
    )

    const transaction = new Transaction()
    transaction.add(...XSOLToUser)
    transaction.add(...tokenToXDegen)

    transaction.feePayer = Xdegen_wallet;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(xDegenWalletKeypair);

    // Send the transaction
    // const signature = await sendTransaction(transaction, connection);

    // // Confirm the transaction
    // const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    return transaction;
}

export const SPLTransfer = async (
    amount: number,
    destination_wallet: PublicKey,
    source_wallet: PublicKey,
    mint: string,
    payer: PublicKey,
) => {
    const mint_address = new PublicKey(mint);

    const sourceAccountAta = await getAssociatedTokenAddress(mint_address, source_wallet);
    const destinationAccountAta = await getAssociatedTokenAddress(mint_address, destination_wallet);

    // Check if the ATAs already exist
    const sourceAccount = await connection.getAccountInfo(sourceAccountAta);
    const destinationAccount = await connection.getAccountInfo(destinationAccountAta);

    const checkDecimals = await connection.getParsedAccountInfo(new PublicKey(mint));
    if (!checkDecimals.value) {
        throw new Error('Token account not found');
    }
    const numberDecimals = (checkDecimals.value.data as ParsedAccountData).parsed.info.decimals as number

    // Create a transaction and add the transfer instruction
    const trxInstruction: TransactionInstruction[] = [];

    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
        sourceAccountAta,
        destinationAccountAta,
        source_wallet,  // owner of the source token account
        Math.floor(Number(amount) * Math.pow(10, numberDecimals))  // amount in smallest units (e.g., lamports for SOL)
    );


    if (!sourceAccount) {
        throw new Error('Token not found');
    }

    if (!destinationAccount) {
        const DCATA = createAssociatedTokenAccountInstruction(
            payer,
            destinationAccountAta,
            destination_wallet,
            mint_address
        );
        trxInstruction.push(DCATA);
    }
    trxInstruction.push(transferInstruction);

    return trxInstruction;


}

export const createTokenIfNotExists = async (
    tokenName: string,
    mintAddress: string
) => {
    console.log("start")
    // Check if the token has already been minted

    // const existingToken = mintedTokens.find(token => token.name === tokenName);


    // Check if the token exists in the database
    // const existingToken = await Token.findOne({ name: tokenName });

    // if (existingToken) {
    //   console.log(
    //     `${tokenName} already exists with mint address: ${existingToken.mintAddress}`
    //   );
    //   return new PublicKey(existingToken.mintAddress);
    // }
    //     const { data, error } = await supabase
    //   .from('meme')
    //   .insert({ mint: "uyguvbilunuj", mainmint: 'Denmark' })

    const { data, error } = await supabase
        .from('meme')
        .select()
        .eq('mainMint', mintAddress)



    // const { data, error } = await supabase.from('meme').select();

    if (error) {
        console.error(error)
        throw error
    };
    if (data.length > 0) {
        console.log(
            `${tokenName} already exists with mint address: ${mintAddress}`
        );
        return data[0].mint;
    }

    // Mint a new token if it doesn't exist
    const tokenMint = await createMint(
        connection,
        xDegenWalletKeypair, // Program wallet or admin wallet
        Xdegen_wallet, // Mint authority
        null, // Freeze authority
        9, // Decimals
    );
    const tokenMintString = tokenMint.toString();
    console.log("Token Mint Public Key:", tokenMintString);

    // Store the token name and mint address in the database
    await saveMeme(tokenName, tokenMintString, mintAddress);

    // Get or create the program's associated token account for this mint
    const programTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,    // Connection to the Solana cluster
        xDegenWalletKeypair,         // Payer's Keypair
        tokenMint,          // Mint address (should be a valid PublicKey)
        Xdegen_wallet         // Owner's address (should be a valid PublicKey)
    );

    console.log("🚀 ~ programTokenAccount:", programTokenAccount)

    // Mint the initial supply of tokens to the program's token account

    await mintTo(
        connection,
        xDegenWalletKeypair,
        tokenMint,
        programTokenAccount.address,
        Xdegen_wallet,
        1000000000000000 * 1e9
    )


    console.log(
        `Minted initial supply of ${tokenName} tokens to the program wallet`
    );
    return tokenMint.toBase58();
};

const saveMeme = async (name: string, mint: string, mainMint: string) => {

    const { error } = await supabase
        .from('meme')
        .insert({ name, mint, mainMint })

    if (error) {
        console.error(error)
        throw error
    }

    console.log("Meme saved successfully")
}

export const getMeme = async (tokenMint: string, tokenName?: string) => {
    const { data, error } = await supabase
        .from('meme')
        .select()
        .eq('mainMint', tokenMint);

    if (error) {
        console.error(error)
        throw error
    }

    if (data.length === 0 && tokenName) {
        const xTokenMint = await createTokenIfNotExists(tokenName, tokenMint)
        return xTokenMint;
    } else if (data.length === 0) {
        return null
    }
    return data[0].mint;
}

export const getSPLTokenBalance = async (walletPublicKey: PublicKey, tokenMintAddress: string) => {
    try {

        // Define the token mint public key (SPL token you want to check)
        const mintPublicKey = new PublicKey(tokenMintAddress);

        //  Get the token accounts by owner for the wallet address
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            walletPublicKey,
            { mint: mintPublicKey }
        );

        if (tokenAccounts.value.length === 0) {
            console.log("No token accounts found for this mint address.");
            return 0;
        }

        // Retrieve the token balance
        const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed;
        const balance = tokenAccountInfo.info.tokenAmount.uiAmount;

        console.log("Token balance:", balance);
        return balance;
    } catch (error) {
        console.error("Error fetching token balance:", error);
    }
}
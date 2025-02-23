"use client";

import { useState, useEffect } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { TokenSelector } from "./tokenSelectorModal";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import AppKit from "../dashboard/reownwallet";
import {
  buy,
  getMeme,
  getSPLTokenBalance,
  sell,
} from "../testToken/swapfunction";
import { Tokenn } from "./tokenSelectorModal";

export interface Token {
  [x: string]: any;
  baseToken: {
    symbol: string;
    address: string;
    name: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceUsd: string;
  priceNative: string;
  liquidity: {
    usd: number;
  };
  volume: {
    h24: number;
  };
}

export function SwapInterface() {
  const [tokenPair, setTokenPair] = useState<{
    selling: Token | null;
    buying: Token | null;
  }>({
    selling: null,
    buying: null,
  });

  const [amounts, setAmounts] = useState({
    selling: "",
    buying: "",
  });

  const [selectorConfig, setSelectorConfig] = useState<{
    isOpen: boolean;
    type: "selling" | "buying";
  }>({
    isOpen: false,
    type: "selling",
  });

  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({
    buyingToken: "0",
    sellingToken: "0",
  });

  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection } = useAppKitConnection();

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address || !tokenPair.buying) return;

      try {
        const walletPublicKey = new PublicKey(address);
        const xdegenMint = "3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce";
        const buyingTokenMint = tokenPair.buying.baseToken.address == xdegenMint ? xdegenMint : await getMeme(tokenPair.buying.baseToken.address);
        const sellingTokenMint = tokenPair.selling ? tokenPair.selling.baseToken.address == xdegenMint ? xdegenMint : await getMeme(tokenPair.selling.baseToken.address) : null;

        const buyingTokenBalance = buyingTokenMint
          ? await getSPLTokenBalance(walletPublicKey, buyingTokenMint)
          : "0";
        const sellingTokenBalance = sellingTokenMint
          ? await getSPLTokenBalance(walletPublicKey, sellingTokenMint)
          : "0";

        setBalances({
          buyingToken: buyingTokenBalance || "0",
          sellingToken: sellingTokenBalance || "0",
        });
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      }
    };

    fetchBalances();
  }, [address, tokenPair.buying]);

  const handleSwitch = () => {
    setTokenPair({
      selling: tokenPair.buying,
      buying: tokenPair.selling,
    });
    setAmounts({
      selling: amounts.buying,
      buying: amounts.selling,
    });
  };

  const handleTokenSelect = (token: Tokenn) => {
    setTokenPair((prev) => ({
      ...prev,
      [selectorConfig.type]: token,
    }));
    setSelectorConfig({ isOpen: false, type: "selling" });
  };

  const calculatePrice = (amount: string, type: "selling" | "buying") => {
    if (!tokenPair.selling || !tokenPair.buying) {
      setAmounts((prev) => ({
        ...prev,
        [type]: amount,
      }));
      return;
    }
    console.log(tokenPair)
    const sellingPrice = Number.parseFloat(tokenPair.selling.priceNative);
    const buyingPrice = Number.parseFloat(tokenPair.buying.priceNative);
    const inputAmount = Number.parseFloat(amount);

    if (isNaN(inputAmount)) return;

    if (type === "selling") {
      const buyingAmount = (inputAmount * sellingPrice) / buyingPrice;
      setAmounts({
        selling: amount,
        buying: buyingAmount.toFixed(6),
      });
    } else {
      const sellingAmount = (inputAmount * buyingPrice) / sellingPrice;
      setAmounts({
        selling: sellingAmount.toFixed(6),
        buying: amount,
      });
    }
  };

  const handleSwap = async () => {
    if (!address || !connection || !tokenPair.buying || !tokenPair.selling)
      return;

    try {
      setLoading(true);
      toast.success("Processing...");

      const walletPublicKey = new PublicKey(address);
      const sellingAmount = Number.parseFloat(amounts.selling);
      const buyingAmount = Number.parseFloat(amounts.buying);

      console.log(tokenPair)

      const transaction = await buy(
        tokenPair.selling.baseToken.address,
        sellingAmount,
        walletPublicKey,
        tokenPair.buying.baseToken.symbol,
        tokenPair.buying.baseToken.address,
        buyingAmount
      )

      const signature = await walletProvider.sendTransaction(
        transaction,
        connection
      );

      toast.success(
        `Swapped ${amounts.selling} ${tokenPair.selling.baseToken.symbol} to ${amounts.buying} ${tokenPair.buying.baseToken.symbol}`,
        {
          action: {
            label: "View Transaction",
            onClick: () =>
              window.open(
                `https://solscan.io/tx/${signature}?cluster=devnet`,
                "_blank"
              ),
          },
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (!address) return "Connect Wallet";
    if (!tokenPair.selling || !tokenPair.buying) return "Select tokens";
    if (!amounts.selling || !amounts.buying) return "Enter an amount";
    return "Swap";
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Card className="w-full max-w-md mx-auto bg-secondary border-neutral-800 text-white">
        <div className="p-4 space-y-4">
          {/* Selling Section */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-400">Selling</span>
              <span className="text-sm text-neutral-400">
                Balance: {balances.sellingToken}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-background border-neutral-800 hover:bg-primary/10 text-white hover:border-primary/30"
                onClick={() =>
                  setSelectorConfig({ isOpen: true, type: "selling" })
                }
              >
                {tokenPair.selling ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        tokenPair.selling.info.imageUrl ||
                        `/placeholder.svg?height=20&width=20`
                      }
                      alt={tokenPair.selling.baseToken.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{tokenPair.selling.baseToken.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
                <ChevronDown className="ml-5 h-4 w-4" />
              </Button>
              <Input
                type="text"
                placeholder="0.00"
                value={amounts.selling}
                onChange={(e) => calculatePrice(e.target.value, "selling")}
                className="bg-background no-scrollbar focus:border-primary/10 border-neutral-800 text-right overflow-hidden"
              />
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background border border-primary/50 hover:bg-secondary"
              onClick={handleSwitch}
            >
              <ArrowDownUp className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Buying Section */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-400">Buying</span>
              <span className="text-sm text-neutral-400">
                Balance: {balances.buyingToken}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-background border-neutral-800 hover:bg-primary/10 text-white hover:border-primary/30"
                onClick={() =>
                  setSelectorConfig({ isOpen: true, type: "buying" })
                }
              >
                {tokenPair.buying ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        tokenPair.buying.info.imageUrl ||
                        `/placeholder.svg?height=20&width=20`
                      }
                      alt={tokenPair.buying.baseToken.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{tokenPair.buying.baseToken.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
                <ChevronDown className="ml-5 h-4 w-4" />
              </Button>
              <Input
                type="text"
                placeholder="0.00"
                value={amounts.buying}
                onChange={(e) => calculatePrice(e.target.value, "buying")}
                className="bg-background focus:border-primary/10 border-neutral-800 text-right no-scrollbar"
              />
            </div>
          </div>

        </div>

        <TokenSelector
          isOpen={selectorConfig.isOpen}
          onClose={() =>
            setSelectorConfig({ ...selectorConfig, isOpen: false })
          }
          onSelect={handleTokenSelect}
        />
      </Card>
      {address ? (
        <Button
          className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
          onClick={handleSwap}
          disabled={loading || !amounts.selling || !amounts.buying}
        >
          {loading ? "Processing..." : getButtonText()}
        </Button>
      ) : (
        <AppKit />
      )}
    </div>
  );
}

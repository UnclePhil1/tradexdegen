import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { claimXSOL, SolToken } from "../testToken";
import { toast } from "sonner";
import AppKit from "./reownwallet";
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppKitAccount } from "@reown/appkit/react";

export default function DemoFund() {
  const location = useLocation();
  const [balance, setBalance] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();

  const { isConnected } = useAppKitAccount();
  
  if (!isConnected) {
    console.log("Wallet not connected");
  } else {
    console.log("Wallet connected");
  }

  const handleCreateFund = () => {
    setShowDialog(true);
  };

  const handleSetBalance = () => {
    window.location.href = `/funds?balance=${balance}`;
  };

  const testSol = async (walletAddress: string) => {
    try {
      setLoading(true);
      const response = await SolToken(walletAddress);
      console.log(response);
      toast.success("Faucet claimed successfully");
    } catch (error) {
      toast.warning("Transaction might have failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const claim = async () => {
    const amount = 500;
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }
    try {
      setLoading(true);
      const tx = await claimXSOL(publicKey, amount);
      console.log(tx?.message);
      toast.success("XSOL claimed successfully");
    } catch (error) {
      toast.warning("Transaction might have failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const balanceParam = searchParams.get("balance");
    if (balanceParam) {
      setBalance(balanceParam);
    } else {
      setShowEmptyState(true);
    }
  }, [location.search]);

  if (showEmptyState) {
    return (
      <div className="bg-black text-white min-h-screen p-6">
        <h1 className="text-4xl font-bold mb-2">Demo Fund</h1>
        <p className="text-gray-400 mb-6">
          New token pairs are updated in real-time
        </p>
        <div className="bg-[#111] rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-4">Your Fund is empty</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Claim the Faucet for gas fees and claim XSOL to start trading.
          </p>
          <Dialog>
            <DialogTrigger>
              {publicKey || isConnected ? (
                <div className="flex gap-4">
                  <Dialog>
                    <DialogTrigger className="bg-white/10 rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary">
                      Claim Faucet
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">
                          Claim your faucet
                        </DialogTitle>
                        <DialogDescription className="flex flex-col gap-2">
                          <p className="text-sm text-green-500">
                            If the Xdegen faucet is playing hard to get, no
                            worries! Try claiming from an external faucet
                            instead.
                          </p>
                          <div className="my-2 p-[0.5px] w-full bg-white/30"></div>
                          <button
                            className="bg-white/10 text-white rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary w-full hidden"
                            onClick={() => publicKey && testSol(publicKey.toBase58())}
                            disabled={loading}
                          >
                            Claim Faucet
                          </button>
                          <a
                            href="https://faucet.solana.com/"
                            target="_blank"
                            className="bg-white/10 text-white rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary w-full text-center self-center"
                          >
                            Claim faucet from Solana.com
                          </a>
                          <a
                            href="https://faucet.quicknode.com/solana/devnet"
                            target="_blank"
                            className="bg-white/10 text-white rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary w-full text-center self-center"
                          >
                            Claim faucet from QuickNode
                          </a>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  <button
                    className="bg-green-400 hover:bg-primary text-black font-semibold py-2 px-4 rounded-full"
                    onClick={claim}
                    disabled={loading}
                  >
                    Claim XSOL
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AppKit />
                </div>
              )}
            </DialogTrigger>
            {showDialog && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Set balance for demo account
                  </DialogTitle>
                  <DialogDescription>
                    <p className="text-gray-400 mb-2">
                      Account:{" "}
                      {publicKey
                        ? `${publicKey.toString().slice(0, 4)}...${publicKey
                            .toString()
                            .slice(-4)}`
                        : "Not connected"}
                    </p>
                    <input
                      type="number"
                      placeholder="Amount to fund in dusdt"
                      className="w-full bg-[#333] text-white p-2 rounded mb-4"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                    />
                    <button
                      className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full w-full"
                      onClick={handleSetBalance}
                    >
                      Set Balance
                    </button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-2">Demo Fund</h1>
      <p className="text-gray-400 mb-6">
        New token pairs are updated in real-time
      </p>
      <div className="bg-[#111] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-[#222] text-gray-400 px-2 py-1 rounded text-sm">
            <p className="text-gray-400 mb-2">
              Account:{" "}
              {publicKey
                ? `${publicKey.toString().slice(0, 4)}...${publicKey
                    .toString()
                    .slice(-4)}`
                : "Not connected"}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Demo Balance</p>
            <p className="text-3xl font-bold">{balance} usdt</p>
          </div>
          <div>
            <a
              href="/trade"
              className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full mr-2"
            >
              Trade
            </a>
            <Dialog>
              <DialogTrigger>
                <button
                  className="bg-white text-black font-semibold py-2 px-4 rounded-full"
                  onClick={handleCreateFund}
                >
                  Edit balance
                </button>
              </DialogTrigger>
              {showDialog && (
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Set balance for demo account
                    </DialogTitle>
                    <DialogDescription>
                      <p className="text-gray-400 mb-2">
                        Account:{" "}
                        {publicKey
                          ? `${publicKey.toString().slice(0, 4)}...${publicKey
                              .toString()
                              .slice(-4)}`
                          : "Not connected"}
                      </p>
                      <input
                        type="number"
                        placeholder="Amount to fund in dusdt"
                        className="w-full bg-[#333] text-white p-2 rounded mb-4"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                      />
                      <button
                        className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full w-full"
                        onClick={handleSetBalance}
                      >
                        Set Balance
                      </button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              )}
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

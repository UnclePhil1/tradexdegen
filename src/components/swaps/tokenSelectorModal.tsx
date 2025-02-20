"use client"

import { useState, useEffect } from "react"
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"

export interface Tokenn {
  baseToken: {
    symbol: string
    address: string
    name: string
  }
  priceUsd: string
  liquidity: {
    usd: number
  }
  volume: {
    h24: number
  }
  info: {
    imageUrl: string
  }
}

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Tokenn) => void
}

export function TokenSelector({ isOpen, onClose, onSelect }: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Tokenn[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch("https://api.dexscreener.com/latest/dex/search?q=sol/sol")
        const data = await response.json()
        console.log("Data set", data)
        setTokens(data.pairs || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching tokens:", error)
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchTokens()
    }
  }, [isOpen])

  const filteredTokens = tokens.filter(
    (token) =>
      token.baseToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.baseToken.address.toLowerCase().includes(search.toLowerCase()) ||
      token.baseToken.name.toLowerCase().includes(search.toLowerCase())
  )

  const PopularTokensSkeleton = () => (
    <div className="flex gap-2 overflow-x-auto py-2">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  )

  const TokenListSkeleton = () => (
    <>
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 no-scrollbar">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="w-20 h-4 mb-2" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      ))}
    </>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-white border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-white">Select Token</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by token or paste address"
            className="pl-9 focus:border-primary/30 bg-secondary border-neutral-800 text-white placeholder:text-neutral-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <X
              className="absolute right-3 top-3 h-4 w-4 text-neutral-400 cursor-pointer"
              onClick={() => setSearch("")}
            />
          )}
        </div>

        {/* Popular Tokens Section */}
        {loading ? (
          <PopularTokensSkeleton />
        ) : (
          <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
            {tokens.slice(0, 4).map((token) => (
              <button
                key={token.baseToken.address}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary hover:bg-primary/10 transition-colors"
                onClick={() => onSelect(token)}
              >
                <img
                  src={token.info.imageUrl || `/placeholder.svg?height=16&width=16`}
                  alt={token.baseToken.symbol}
                  className="w-4 h-4 rounded-full border border-primary/30"
                />
                <span>{token.baseToken.symbol}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Token List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
          {loading ? (
            <TokenListSkeleton />
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-4 text-neutral-400">
              No tokens found
            </div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.baseToken.address}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-primary/10 transition-colors"
                onClick={() => onSelect(token)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={token.info.imageUrl || `/placeholder.svg?height=32&width=32`}
                    alt={token.baseToken.symbol}
                    className="w-8 h-8 rounded-full border border-primary/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg?height=32&width=32'
                    }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{token.baseToken.symbol}</div>
                    <div className="text-sm text-neutral-400">{token.baseToken.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[15px]">${Number.parseFloat(token.priceUsd).toFixed(6)}</p>
                  <p className="text-[12px] text-neutral-400">Vol: ${token.volume?.h24?.toLocaleString()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
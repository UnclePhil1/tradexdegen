"use client"

import { useState, useEffect } from "react"
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
// import { cn } from "../../lib/utils"

interface TokenData {
  baseToken: {
    symbol: string
    address: string
    name: string
  }
  quoteToken: {
    symbol: string
  }
  priceUsd: string
  priceNative: string
  liquidity: {
    usd: number
  }
  volume: {
    h24: number
  }
  info?: {
    imageUrl?: string
  }
}

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: TokenData) => void
}

export function TokenSelector({ isOpen, onClose, onSelect }: TokenSelectorProps) {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokens = async () => {
      if (!isOpen) return
      try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=sol/sol')
        const data = await response.json()
        // Filter out tokens with invalid prices or missing data
        const validTokens = (data.pairs || []).filter((token: TokenData) => 
          token.baseToken?.address && 
          token.priceUsd && 
          parseFloat(token.priceUsd) > 0 &&
          token.liquidity?.usd > 1000 // Only show tokens with decent liquidity
        )
        setTokens(validTokens)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setLoading(false)
      }
    }

    fetchTokens()
  }, [isOpen])

  const filteredTokens = tokens.filter(token => 
    token.baseToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.baseToken.address.toLowerCase().includes(search.toLowerCase()) ||
    token.baseToken.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Function to get token image URL
  const getTokenImage = (token: TokenData) => {
    // Try to get image from token info
    if (token.info?.imageUrl) return token.info.imageUrl

    // Fallback to common token logos
    const commonTokens: Record<string, string> = {
      'SOL': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      'USDC': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      'BONK': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
      'RAY': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    }

    return commonTokens[token.baseToken.symbol] || '/placeholder.svg?height=32&width=32'
  }

  const popularTokens = tokens
    .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
    .slice(0, 4)

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    if (numPrice < 0.01) return numPrice.toExponential(2)
    return numPrice.toFixed(6)
  }

  const formatVolume = (volume?: number) => {
    if (!volume) return '0'
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#1C2537] text-white border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">Select Token</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by token or paste address"
            className="pl-9 bg-[#141B2B] border-neutral-800 text-white placeholder:text-neutral-400"
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
        <div className="flex gap-2 overflow-x-auto py-2">
          {popularTokens.map((token) => (
            <button
              key={token.baseToken.address}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#141B2B] hover:bg-[#1C2537] transition-colors"
              onClick={() => onSelect(token)}
            >
              <img 
                src={getTokenImage(token) || "/placeholder.svg"}
                alt={token.baseToken.symbol}
                className="w-4 h-4 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg?height=16&width=16'
                }}
              />
              <span>{token.baseToken.symbol}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-neutral-400">Loading tokens...</div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-4 text-neutral-400">No tokens found</div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.baseToken.address}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#1C2537] transition-colors"
                onClick={() => onSelect(token)}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={getTokenImage(token) || "/placeholder.svg"}
                    alt={token.baseToken.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg?height=32&width=32'
                    }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{token.baseToken.symbol}</div>
                    <div className="text-sm text-neutral-400">
                      {token.baseToken.name || token.baseToken.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div>${formatPrice(token.priceUsd)}</div>
                  <div className="text-sm text-neutral-400">
                    Vol: {formatVolume(token.volume?.h24)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
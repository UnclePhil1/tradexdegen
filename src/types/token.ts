export interface Token {
    symbol: string
    name: string
    address: string
    logoURI: string
    balance?: string
    price?: number
    decimals: number
  }
  
  export interface TokenPair {
    selling: Token | null
    buying: Token | null
  }
  
  export interface TokenAmount {
    amount: string
    usdValue: string
  }
  
  

export const CHAIN_IDS = [56, 97]

export enum ConnectorNames {
    MetaMask = 'metaMask',
    Injected = 'injected',
    WalletConnect = 'walletConnect',
    WalletLink = 'coinbaseWallet'
}

export enum Strategy {
    furfiStrategy = 'furfiStrategy',
    standardStrategy = 'standardStrategy',
    stablecoinStrategy = 'stablecoinStrategy',
}


export const pairs = ["dai_busd", "usdc_busd", "usdc_usdt", "usdt_busd", "eth_usdc", "btcb_busd", "busd_bnb"];

export const strategies = ['furfiStrategy', 'standardStrategy', 'stablecoinStrategy'];


// export const DATABASE_URL = 'http://localhost:4000/api/details'
export const DATABASE_URL = 'http://38.242.254.162:4000/api/details'



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


export const pairs = ['dai_busd', 'usdc_busd', 'usdc_usdt', 'busd_usdt'];
// export const pairs = ['busd_usdt'];


export const strategies = ['furfiStrategy', 'standardStrategy', 'stablecoinStrategy'];


// export const DATABASE_URL = 'http://localhost:4000/api/computed-apys'
export const DATABASE_URL = 'http://185.53.46.150:4000/api/computed-apys'


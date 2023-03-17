import UsdtLogo from '../asset/images/crypto-usdt.png'
import UsdcLogo from '../asset/images/crypto-usdc.png'
import DaiLogo from '../asset/images/crypto-dai.svg'
import EthereumLogo from '../asset/images/crypto-ethereum.png'
import BtcLogo from '../asset/images/crypto-btc.svg'
import BusdLogo from '../asset/images/crypto-busd.svg'
import BnbLogo from '../asset/images/crypto-bnb.svg'
import FurfiLogo from '../asset/images/furfi-logo.svg'
import FurusdLogo from '../asset/images/furfi-logo.svg'

export interface IToken {
    name: string,
    symbol: string,
    decimal: number,
    logo: string
}

export const tokens: Record<string, IToken> = {
    'bnb': {
        name: 'BNB',
        symbol: 'BNB',
        decimal: 18,
        logo: BnbLogo
    },
    'busd': {
        name: 'BUSD',
        symbol: 'BUSD',
        decimal: 18,
        logo: BusdLogo
    },
    'usdc': {
        name: 'USDC',
        symbol: 'USDC',
        decimal: 18,
        logo: UsdcLogo
    },
    'usdt': {
        name: 'USDT',
        symbol: 'USDT',
        decimal: 18,
        logo: UsdtLogo
    },
    'dai': {
        name: 'DAI',
        symbol: 'DAI',
        decimal: 18,
        logo: DaiLogo
    },
    // 'eth': {
    //     name: 'WETH',
    //     symbol: 'WETH',
    //     decimal: 18,
    //     logo: EthereumLogo
    // },
    // 'btcb': {
    //     name: 'WBTC',
    //     symbol: 'WBTC',
    //     decimal: 18,
    //     logo: BtcLogo
    // },
    // 'furfi': {
    //     name: 'FURFI',
    //     symbol: 'FURFI',
    //     decimal: 18,
    //     logo: FurfiLogo
    // },
    'fusd': {
        name: 'FUSD',
        symbol: 'FUSD',
        decimal: 18,
        logo: FurusdLogo
    }

}
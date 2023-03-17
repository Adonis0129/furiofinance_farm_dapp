
import { useMemo } from 'react'
import { getContract } from 'src/helper'
import { erc20ABI, useSigner, useProvider, useNetwork } from 'wagmi'
import FurfiStrategyABI from '../config/abi/furfiStrategy.json'
import StandardStrategyABI from '../config/abi/standardStrategy.json'
import StablecoinStrategyABI from '../config/abi/stablecoinStrategy.json'
import FreezeABI from '../config/abi/freezer.json'
import ReferralABI from '../config/abi/referrer.json'
import StakingPoolABI from '../config/abi/staking.json'
import { Strategy } from 'src/config'
import addresses from 'src/config/address'
import { DEFAULT_CHAIN_ID } from 'src/config/chains'



export function useTokenContract(tokenAddress: string, withSignerIfPossible?: boolean) {
    return useContract(tokenAddress, erc20ABI, withSignerIfPossible)
}

export function useStrategyContract(pair: string, strategy: Strategy) {
    let addr = "", abi = {}
    if (strategy === Strategy.furfiStrategy) {
        addr = addresses[pair]['furfiStrategy'][DEFAULT_CHAIN_ID]
        abi = FurfiStrategyABI
    } else if (strategy === Strategy.standardStrategy) {
        addr = addresses[pair]['standardStrategy'][DEFAULT_CHAIN_ID]
        abi = StandardStrategyABI
    } else if (strategy === Strategy.stablecoinStrategy) {
        addr = addresses[pair]['stablecoinStrategy'][DEFAULT_CHAIN_ID]
        abi = StablecoinStrategyABI
    }
    return useContract(addr, abi)
}


export function useFreezeContract() {
    const freezeAddr = addresses.freeze[DEFAULT_CHAIN_ID]
    const abi = FreezeABI
    return useContract(freezeAddr, abi)
}

export function useReferralContract() {
    const referralAddr = addresses.referral[DEFAULT_CHAIN_ID]
    const abi = ReferralABI
    return useContract(referralAddr, abi)
}

export function useStakingContract() {
    const stakingAddr = addresses.stakingPool[DEFAULT_CHAIN_ID]
    const abi = StakingPoolABI
    return useContract(stakingAddr, abi)
}

export function useContract(
    address: string,
    ABI: any,
    withSignerIfPossible = true
) {
    const { chain } = useNetwork()
    const provider = useProvider({ chainId: chain?.id })
    const { data: signer } = useSigner()
    const providerOrSigner = withSignerIfPossible ? signer ?? provider : provider

    const canReturnContract = useMemo(() => address && ABI && providerOrSigner, [address, ABI, providerOrSigner])

    return useMemo(() => {
        if (!canReturnContract) return null
        try {
            return getContract(address, ABI, providerOrSigner)
        } catch (err) {
            console.error('Failed to get contract', err)
            return null
        }
    }, [address, ABI, providerOrSigner])
}
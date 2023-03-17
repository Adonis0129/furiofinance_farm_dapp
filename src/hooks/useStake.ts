import { parseUnits, formatUnits } from "@ethersproject/units"
import { Contract } from "ethers"
import { useCallback, useEffect, useState, useMemo } from "react"
import { useAccount, useSigner } from "wagmi"
import { toast } from 'react-toastify';
import { ContractCallContext, ContractCallResults } from 'ethereum-multicall';

import { multicall } from 'src/helper/multiCall';
import addresses from 'src/config/address';
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import StakingPoolABI from '../config/abi/staking.json'
import { useAllTransactions, useTransactionAdder, useFetchPendingTxns, useClearPendingTxns } from "src/state/transactions/hooks"
import { useStakingContract } from "./useContract"
import ERC20 from 'src/config/erc20';
import { getDefaultProvider } from 'src/helper/provider';
import { getErrorText } from "src/helper/getErrorText";



function useStake() {

    const [stakedAmt, setStakedAmt] = useState<string>('0')
    const [pendingFurFi, setPendingFurFiRewards] = useState<string>('0')
    const [pendingLP, setPendingLPRewards] = useState<string>('0')
    const [totalStaked, setTotalStaked] = useState<string>('0')

    const { address: account } = useAccount()
    const allTransactions = useAllTransactions()
    const addTransaction = useTransactionAdder()
    const fetchPendingTransaction = useFetchPendingTxns()
    const clearPendingTransaction = useClearPendingTxns()

    const { data: signer } = useSigner();
    const defaultProvider = getDefaultProvider();

    const staking = useStakingContract() as Contract

    const furfiToken = useMemo(() => {
        return new ERC20(addresses.furfi[DEFAULT_CHAIN_ID], signer ?? defaultProvider, 'FURFI');
    }, [signer]);

    const callContext: ContractCallContext = {
        reference: "getStakingPoolData",
        contractAddress: addresses['stakingPool'][DEFAULT_CHAIN_ID],
        abi: StakingPoolABI,
        calls: [
            { reference: 'getStakedAmount', methodName: "balanceOf", methodParameters: [account] },
            { reference: 'getPendingFurFiRewards', methodName: 'getPendingFurFiRewards', methodParameters: [account] },
            { reference: 'getPendingLPRewards', methodName: 'lpBalanceOf', methodParameters: [account] },
            { reference: 'getTotalStaked', methodName: 'totalStaked', methodParameters: [] }
        ],
    }
    const fetchStakingInfo = useCallback(
        async () => {
            if (account) {
                const data: ContractCallResults = await multicall.call(callContext);
                const _stakedAmt = formatUnits(data.results['getStakingPoolData']['callsReturnContext'][0]['returnValues'][0].hex, 18)
                const _pendingFurFi = formatUnits(data.results['getStakingPoolData']['callsReturnContext'][1]['returnValues'][0].hex, 18)
                const _pendingLP = formatUnits(data.results['getStakingPoolData']['callsReturnContext'][2]['returnValues'][0].hex, 18)
                const _totakStaked = formatUnits(data.results['getStakingPoolData']['callsReturnContext'][3]['returnValues'][0].hex, 18)
                setStakedAmt(_stakedAmt)
                setPendingFurFiRewards(_pendingFurFi)
                setPendingLPRewards(_pendingLP)
                setTotalStaked(_totakStaked)
            }
        }, [staking, account, allTransactions]
    )

    const stake = useCallback(
        async (amount: string) => {
            const amountBn = parseUnits(amount, 18)
            let tx: any;
            try {
                tx = await furfiToken.approve(addresses.stakingPool[DEFAULT_CHAIN_ID], amountBn);
                fetchPendingTransaction(tx.hash, 'Stake FurFi')
                await tx.wait();
                let tx1 = await staking.stake(amountBn);
                await tx1.wait();
                addTransaction(tx, { summary: `Stake ${amount} FurFi` })
                toast.success(`Staked ${amount} FurFi successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to stake ${amount} FurFi`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            } 
        },
        [staking, addTransaction]
    )

    const unstake = useCallback(
        async (amount: string) => {
            const amountBn = parseUnits(amount, 18)
            let tx: any;
            try {
                tx = await staking.unstake(amountBn);
                fetchPendingTransaction(tx.hash, 'Unstake FurFi')
                await tx.wait();
                addTransaction(tx, { summary: `Unstake ${amount} FurFi` })
                toast.success(`Unstaked ${amount} FurFi successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to unstake ${amount} FurFi`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            } 
        },
        [staking, addTransaction]
    )

    const claimRewards = useCallback(
        async () => {
            let tx: any;
            try {
                const pendingLPBn = parseUnits(String(pendingLP), 18)
                const pendingFurFiBn = parseUnits(String(pendingFurFi), 18)
                tx = await staking.claimLpTokens(pendingLPBn, pendingFurFiBn, account);
                fetchPendingTransaction(tx.hash, 'Claim LP and FurFi rewards')
                await tx.wait();
                addTransaction(tx, { summary: 'Claim LP and FurFi rewards' })
                toast.success('Claimed LP and FurFi rewards successfully', {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, 'Faild to claim LP and FurFi rewards');
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            } 
        },
        [staking, addTransaction]
    )

    useEffect(() => {
        if (account)
            fetchStakingInfo().catch(err => console.log('Failed to fetch Staking Info'))
    }, [account, allTransactions])

    return { stakedAmount: stakedAmt, pendingFurFiRewards: pendingFurFi, pendingLPRewards: pendingLP, totalStaked, stake, unstake, claimRewards }
}

export default useStake
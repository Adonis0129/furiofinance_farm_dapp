import { Contract } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { toast } from 'react-toastify';
import { ContractCallContext, ContractCallResults } from 'ethereum-multicall';
import { formatUnits } from "@ethersproject/units";
import { multicall } from 'src/helper/multiCall';
import ReferralABI from '../config/abi/referrer.json'
import { useAllTransactions, useTransactionAdder, useFetchPendingTxns, useClearPendingTxns } from "src/state/transactions/hooks"
import { useReferralContract } from "./useContract"
import addresses from "src/config/address"
import { DEFAULT_CHAIN_ID } from "src/config/chains"
import { pairs } from "src/config";
import { strategies } from "src/config";
import { getErrorText } from "src/helper/getErrorText";

function useReferral() {

    const [friends, setFriends] = useState<string>('0')
    const [totalEarning, setEarning] = useState<string>('0')
    const [pendingRewards, setPendingRewards] = useState<string>('0')
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const { address: account } = useAccount()

    const allTransactions = useAllTransactions()
    const addTransaction = useTransactionAdder()
    const fetchPendingTransaction = useFetchPendingTxns()
    const clearPendingTransaction = useClearPendingTxns()

    const poolAddrs: string[] = []

    useEffect(() => {
        pairs.map(pair => {
            strategies.forEach((strategy) => {
                poolAddrs.push(addresses[pair][strategy][DEFAULT_CHAIN_ID])
            })
        })
    }, [addresses, account])

    const referral = useReferralContract() as Contract

    const callContext: ContractCallContext = {
        reference: "getReferralData",
        contractAddress: addresses['referral'][DEFAULT_CHAIN_ID],
        abi: ReferralABI,
        calls: [
            { reference: 'getActiveFriends', methodName: "activeFriends", methodParameters: [account] },
            { reference: 'getAllTotalEarnedAmount', methodName: 'getAllTotalEarnedAmount', methodParameters: [poolAddrs, account] },
            { reference: 'getAllReferralRewards', methodName: 'getAllReferralRewards', methodParameters: [poolAddrs, account] },
        ],
    }

    const fetchReferral = useCallback(
        async () => {
            if (poolAddrs && account) {

                setIsFetching(true);

                const data: ContractCallResults = await multicall.call(callContext);

                const _activeFriends = (data.results['getReferralData']['callsReturnContext'][0]['returnValues'][0].hex).toString()
                const _totalEarning = formatUnits(data.results['getReferralData']['callsReturnContext'][1]['returnValues'][0].hex , 18)
                const _pendingRewards = formatUnits(data.results['getReferralData']['callsReturnContext'][2]['returnValues'][0].hex, 18)
                setFriends(_activeFriends)
                setEarning(_totalEarning)
                setPendingRewards(_pendingRewards)

                setIsFetching(false);

            }
        },
        [referral, account, poolAddrs, allTransactions]
    )

    const claim = useCallback(
        async () => {
            let tx: any;
            try {
                tx = await referral.withdrawAllReferralRewards(poolAddrs);
                fetchPendingTransaction(tx.hash, 'Withdraw  all referral rewards')
                await tx.wait();
                addTransaction(tx, { summary: 'Withdraw all referral rewards' })
                toast.success("Withdrawed all referral rewards successfully", {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, "Faild to withdraw all referral rewards");
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            } 
        }, [referral, addTransaction])

    useEffect(() => {
        if (account) {
            fetchReferral().catch(err => console.log('Failed to fetch referral info', err))
        }
    }, [account, allTransactions])

    return {isFetching, friends, totalEarning, pendingRewards, claim }
}

export default useReferral


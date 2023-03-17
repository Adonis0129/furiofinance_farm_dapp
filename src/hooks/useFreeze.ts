import { parseUnits } from "@ethersproject/units";
import { Contract } from "ethers";
import { useCallback, useEffect, useState, useMemo } from "react"
import { useAccount, useSigner } from "wagmi"
import { toast } from 'react-toastify';

import { useAllTransactions, useTransactionAdder, useFetchPendingTxns, useClearPendingTxns } from "src/state/transactions/hooks"
import { IFreezeInfo } from "src/views/freezer/components/CheckBox";
import { useFreezeContract } from "./useContract"
import ERC20 from 'src/config/erc20';
import addresses from 'src/config/address';
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import { getDefaultProvider } from 'src/helper/provider';
import { getErrorText } from "src/helper/getErrorText";




function useFreeze() {

    const [freezing, setFreezing] = useState<Array<IFreezeInfo>>()

    const freezer = useFreezeContract() as Contract;
    const { address: account } = useAccount()

    const allTransactions = useAllTransactions()
    const addTransaction = useTransactionAdder();
    const fetchPendingTransaction = useFetchPendingTxns();
    const clearPendingTransaction = useClearPendingTxns();

    const { data: signer } = useSigner();
    const defaultProvider = getDefaultProvider();

    const furfiToken = useMemo(() => {
        return new ERC20(addresses.furfi[DEFAULT_CHAIN_ID], signer ?? defaultProvider, 'FURFI');
    }, [signer]);

    const freeze = useCallback(
        async (amount: string, period: number) => {
            const amountBn = parseUnits(amount, 18)
            let tx: any;
            try {
                tx = await furfiToken.approve(addresses.freeze[DEFAULT_CHAIN_ID], amountBn);
                fetchPendingTransaction(tx.hash, 'Freeze FurFi')
                await tx.wait();
                let tx1 = await freezer.freeze(amountBn, period);
                await tx1.wait();
                addTransaction(tx, { summary: `Freeze ${amount} FurFi` })
                toast.success(`Freezed ${amount} FurFi successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to freeze ${amount} FurFi`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }   
        }, [freezer, addTransaction]
    )

    const unfreeze = useCallback(
        async (round: number) => {
            let tx: any;
            try {
                tx = await freezer.unfreeze(round);
                fetchPendingTransaction(tx.hash, 'Unfreeze FurFi')
                await tx.wait();
                addTransaction(tx, { summary: `Unfreeze FurFi round${round}` })
                toast.success("Unfreezed FurFi successfully", {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, "Faild to unfreeze FurFi");
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            } 
            }, [freezer, addTransaction]
    
    )

    const claimRewards = useCallback(
        async (round: number) => {
            let tx: any;
            try {
                tx = await freezer.claimPendingRewards(round);
                fetchPendingTransaction(tx.hash, 'Claim rewards from freezing')
                await tx.wait();
                addTransaction(tx, { summary: `Claim rewards round${round} from freezing` })
                toast.success("Claimed rewards from freezing successfully", {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, "Faild to claim rewards from freezing");
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        }, [freezer, addTransaction]
    )

    

    const fetchFreezing = useCallback(async () => {
        const freezing = await freezer.getAllParticipant(account)
        if(freezing) setFreezing(freezing)
        }, [freezer, account, allTransactions]
    )

    useEffect(() => {
        if (account) {
            fetchFreezing().catch(err => console.log('Failed to fetch user freezing info'))
        }
    }, [allTransactions, account])

    return { freezing, freeze, unfreeze, claimRewards }
}

export default useFreeze


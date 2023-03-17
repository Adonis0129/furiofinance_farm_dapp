// import { useCallback, useMemo } from "react"
// import { ethers } from "ethers"
// import { parseUnits } from "@ethersproject/units"
// import ERC20 from "src/config/erc20"
// import { useAccount } from 'wagmi'

// import { useHasPendingApproval, useTransactionAdder, useFetchPendingTxns, useClearPendingTxns } from "src/state/transactions/hooks"
// import useAllowance from "./useAllowance"
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from 'react-toastify';
// import { getErrorText } from "src/helper/getErrorText";



function useApprove(){

    // const { address: account } = useAccount();
    // const addTransaction = useTransactionAdder();
    // const fetchPendingTransaction = useFetchPendingTxns();
    // const clearPendingTransaction = useClearPendingTxns();


    // const approve = useCallback(async (token: ERC20, spender: string, amount: string): Promise<void> => {
    //     const amountBn = parseUnits(amount, 18);
    //     let tx: any;
    //     try {
    //         tx = await token.approve(spender, amountBn);
    //         fetchPendingTransaction(tx.hash, `Approve ${token.symbol}`)
    //         await tx.wait();
    //         addTransaction(tx, {
    //             summary: `Approve ${token.symbol}`,
    //             approval: {
    //                 tokenAddress: token.address,
    //                 spender: spender,
    //             },
    //         });

    //         toast.success(`Approved ${token.symbol} successfully`, {theme:"colored"})

    //     } catch (err: any) {
    //         const errorText = getErrorText(err, `Faild to approve ${token.symbol}`);
    //         toast.error(errorText, {theme:"colored"})
    //     } finally {
    //         if (tx) {
    //             clearPendingTransaction(tx.hash);
    //         }
    //     }

    // }, [account, addTransaction]);

    // return { approve };
}

export default useApprove;
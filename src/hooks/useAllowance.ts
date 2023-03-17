// import { useCallback, useEffect, useState } from 'react'
// import { BigNumber } from 'ethers'
// import { useAccount } from 'wagmi'
import ERC20 from 'src/config/erc20';
// import { formatUnits } from '@ethersproject/units';
// import useRefresh from './useRefresh';
// import { useAllTransactions } from 'src/state/transactions/hooks';


const useAllowance = (token: ERC20, spender: string) => {

    // const { address: account } = useAccount()
    // const { fastRefresh } = useRefresh()
    // const allTransactions = useAllTransactions()

    // const [allowance, setAllowance] = useState<number>(0);

    // const fetchAllowance = useCallback(async () => {
    //     if (account) {
    //         const _allowance = await token.allowance(account, spender);
    //         setAllowance(Number( formatUnits(_allowance ,18))
    //     }
    // }, [account, spender, token]);

    // useEffect(() => {
    //     if (account && spender && token) {
    //         fetchAllowance().catch((err) => console.log(`Failed to fetch allowance: ${err.stack}`));
    //     }
    // }, [account, spender, token, fetchAllowance, allTransactions, fastRefresh]);

    // return allowance;
};

export default useAllowance;



import { useCallback, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { ContractCallContext, ContractCallResults } from 'ethereum-multicall';
import { formatUnits } from "@ethersproject/units";

import { multicall } from 'src/helper/multiCall';
import addresses from 'src/config/address';
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import { tokens } from "src/config/token";
import ERC20ABI from '../config/abi/erc20.json';
import { getDefaultProvider } from "src/helper/provider";
import { useAllTransactions} from "src/state/transactions/hooks"


interface IBalance {
    tokenSymbol: string;
    balance: string;
}

function useBalances () {

    const [balances, setBalances] = useState<IBalance[]>();

    const { address: account } = useAccount();
    const allTransactions = useAllTransactions();
    const provider = getDefaultProvider();


    const contractCallContext: ContractCallContext[] = Object.keys(tokens).map((item) => {
        return{
            reference: tokens[item].symbol,
            contractAddress: addresses[String(tokens[item].symbol).toLocaleLowerCase()][DEFAULT_CHAIN_ID],
            abi: ERC20ABI,
            calls: [
                { reference: 'getBalance', methodName: 'balanceOf', methodParameters: [account] }
            ]
        }
    })

    const fetchBalances = useCallback( async () => {
        const data: ContractCallResults = await multicall.call(contractCallContext);
        const result: IBalance[] = [];
        // console.log("balances-data", data);
        const bnbBalanceBn = await provider.getBalance(String(account));
        result.push({
            tokenSymbol: 'BNB',
            balance: formatUnits(bnbBalanceBn, 18)
        })

        if(data){
            Object.keys(tokens).map((item) => {
                if(tokens[item].symbol != 'BNB') {
                    let _balanceBn = data.results[tokens[item].symbol]['callsReturnContext'][0]['returnValues'][0].hex;
                    result.push({
                        tokenSymbol: tokens[item].symbol,
                        balance: formatUnits(_balanceBn, 18)
                    });
                }
            })
        }

        setBalances(result);

    }, [contractCallContext, account, allTransactions] )


    useEffect(() => {
        if (account) fetchBalances().catch((err) => console.log('Failed to fetch token balances'));
    }, [ account, allTransactions]);

    return { balances };

}

export default useBalances;
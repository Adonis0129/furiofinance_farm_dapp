import { useCallback, useEffect, useState } from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { Contract } from 'ethers';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { ContractCallContext, ContractCallResults } from 'ethereum-multicall';

import ERC20 from 'src/config/erc20';
import { Strategy } from 'src/config';
import { useStrategyContract } from './useContract';
import addresses from 'src/config/address';
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import { pairs } from 'src/config';
import { strategies } from 'src/config';

import FurfiStrategyABI from '../config/abi/furfiStrategy.json';
import StandardStrategyABI from '../config/abi/standardStrategy.json';
import StablecoinStrategyABI from '../config/abi/stablecoinStrategy.json';

import { multicall } from 'src/helper/multiCall';
import { IInvestInfo } from 'src/views/dashboard/components/ClaimCard';
import { useAllTransactions, useTransactionAdder, useFetchPendingTxns, useClearPendingTxns } from "src/state/transactions/hooks"
import { getErrorText } from "src/helper/getErrorText";



export const useDepositFromToken = (pair: string, strategy: Strategy) => {

    const addTransaction = useTransactionAdder();
    const fetchPendingTransaction = useFetchPendingTxns();
    const clearPendingTransaction = useClearPendingTxns();

    const strategyContract = useStrategyContract(pair, strategy) as Contract;

    const handleDepositFromToken = useCallback(
        async(token: ERC20, amount: string, referrer: string) => {
            const amountBn = parseUnits(amount, 18);
            let tx: any;
            try {
                tx = await token.approve(addresses[pair][strategy][DEFAULT_CHAIN_ID], amountBn);
                fetchPendingTransaction(tx.hash, `Deposit ${amount + ' ' + token.symbol}`)
                await tx.wait();
                let tx1: any;
                if(token.symbol=='FUSD'){
                    tx1 = await strategyContract.depositFromToken(
                        token.address,
                        amountBn,
                        referrer ?? AddressZero,
                        [token.address],
                        [addresses.usdc[DEFAULT_CHAIN_ID]],
                        [amountBn],
                        [0],
                        10000,
                        MaxUint256
                    ); 
                }
                else{
                    tx1 = await strategyContract.depositFromToken(
                        token.address,
                        amountBn,
                        referrer ?? AddressZero,
                        [token.address],
                        [addresses.bnb[DEFAULT_CHAIN_ID]],
                        [amountBn],
                        [0],
                        10000,
                        MaxUint256
                    ); 
                }
                await tx1.wait();
                addTransaction(tx, { summary: `Deposit ${amount + ' ' + token.symbol}` })
                toast.success(`Deposited ${amount + ' ' + token.symbol + ''} successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to deposit ${amount + ' ' + token.symbol}`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        },
        [strategyContract, addTransaction]
    );
    return { onDepositFromToken: handleDepositFromToken };
};

export const useDepositFromEth = (pair: string, strategy: Strategy) => {

    const addTransaction = useTransactionAdder();
    const fetchPendingTransaction = useFetchPendingTxns();
    const clearPendingTransaction = useClearPendingTxns();
    
    const strategyContract = useStrategyContract(pair, strategy) as Contract;
    const tokens = pair.split('_');
    const tokenA = addresses[tokens[0]][DEFAULT_CHAIN_ID];
    const tokenB = addresses[tokens[1]][DEFAULT_CHAIN_ID];

    const handleDepositFromEth = useCallback(
        async (amount: string, referrer: string) => {
            const amountBn = parseUnits(amount, 18);
            let tx: any;
            try {
                if(tokens[1]=='bnb'){
                    tx = await strategyContract.deposit(
                        referrer ?? AddressZero,
                        [addresses.bnb[DEFAULT_CHAIN_ID]],
                        [tokenA],
                        [amountBn.div(2)],
                        [0],
                        10000,
                        MaxUint256,
                        { value: amountBn }
                    );
                }
                else{
                    tx = await strategyContract.deposit(
                        referrer ?? AddressZero,
                        [addresses.bnb[DEFAULT_CHAIN_ID], addresses.bnb[DEFAULT_CHAIN_ID]],
                        [tokenA, tokenB],
                        [amountBn.div(2), amountBn.div(2)],
                        [0, 0],
                        10000,
                        MaxUint256,
                        { value: amountBn }
                    );
                }                
                fetchPendingTransaction(tx.hash, `Deposit ${amount + ' BNB'}`)
                await tx.wait();
                addTransaction(tx, { summary: `Deposit ${amount + ' BNB'}` })
                toast.success(`Deposited ${amount + ' BNB '} successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to deposit ${amount + ' BNB'}`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        },
        [strategyContract, addTransaction]
    );
    return { onDepositFromEth: handleDepositFromEth };
};

export const useWithdrawToToken = (pair: string, strategy: Strategy) => {

    const addTransaction = useTransactionAdder();
    const fetchPendingTransaction = useFetchPendingTxns();
    const clearPendingTransaction = useClearPendingTxns();

    const strategyContract = useStrategyContract(pair, strategy) as Contract;

    const handleWithdrawToToken = useCallback(
        async (token: ERC20, amount: string) => {
            const amountBn = parseUnits(amount, 18);
            let tx: any;
            try {
                if(token.symbol=='FUSD'){
                    tx = await strategyContract.withdrawToToken(
                        token.address,
                        amountBn,
                        [token.address],
                        [addresses.usdc[DEFAULT_CHAIN_ID]],
                        [amountBn],
                        [0],
                        10000,
                        MaxUint256
                    ); 
                }
                else{
                    tx = await strategyContract.withdrawToToken(
                        token.address,
                        amountBn,
                        [token.address],
                        [addresses.bnb[DEFAULT_CHAIN_ID]],
                        [amountBn],
                        [0],
                        10000,
                        MaxUint256
                    );
                }             
                fetchPendingTransaction(tx.hash, `Withdraw ${amount + 'LP to' + token.symbol}`)
                await tx.wait();
                addTransaction(tx, { summary: `Withdraw ${amount + 'LP to' + token.symbol}`})
                toast.success(`Withdrawed ${amount + 'LP to ' + token.symbol + ''} successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to withdraw ${amount + 'LP to ' + token.symbol}`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        },
        [strategyContract, addTransaction]
    );
    return { onWithdrawToToken: handleWithdrawToToken };
};

export const useWithdrawToEth = (pair: string, strategy: Strategy) => {

    const addTransaction = useTransactionAdder();
    const fetchPendingTransaction = useFetchPendingTxns();
    const clearPendingTransaction = useClearPendingTxns();
    
    const strategyContract = useStrategyContract(pair, strategy) as Contract;
    const tokens = pair.split('_');
    const tokenA = addresses[tokens[0]][DEFAULT_CHAIN_ID];
    const tokenB = addresses[tokens[1]][DEFAULT_CHAIN_ID];

    const handleWithdrawToEth = useCallback(
        async (amount: string) => {
            const amountBn = parseUnits(amount, 18);
            let tx: any;
            try {
                if(tokens[1]=='bnb'){
                    tx = await strategyContract.withdraw(
                        amountBn,
                        [tokenA],
                        [addresses.bnb[DEFAULT_CHAIN_ID]],
                        [amountBn.div(2)],
                        [0],
                        10000,
                        MaxUint256
                    );
                }
                else{
                    tx = await strategyContract.withdraw(
                        amountBn,
                        [tokenA, tokenB],
                        [addresses.bnb[DEFAULT_CHAIN_ID], addresses.bnb[DEFAULT_CHAIN_ID]],
                        [amountBn.div(2), amountBn.div(2)],
                        [0, 0],
                        10000,
                        MaxUint256
                    );
                }              
                fetchPendingTransaction(tx.hash, `Withdraw ${amount + ' LP to BNB '}`)
                await tx.wait();
                addTransaction(tx, { summary: `Withdraw ${amount + ' LP to BNB '}`})
                toast.success(`Withdrawed ${amount + ' LP to BNB '} successfully`, {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, `Faild to Withdraw ${amount + ' LP to BNB '}`);
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        },
        [strategyContract, addTransaction]
    );
    return { onWithdrawToEth: handleWithdrawToEth };
};

export const useClaimRewards = (pair: string, strategy: Strategy) => {

    const addTransaction = useTransactionAdder();
    const fetchPendingTransaction = useFetchPendingTxns();
    const clearPendingTransaction = useClearPendingTxns();

    const strategyContract = useStrategyContract(pair, strategy) as Contract;

    const handleClaimRewards = useCallback( async () => {
        if (strategy === Strategy.stablecoinStrategy) return;
        else if (strategy === Strategy.furfiStrategy) {
            let tx: any;
            try {
                tx = await strategyContract.furiofiStrategyClaimLP();
                fetchPendingTransaction(tx.hash, 'Claim FurFi and LP rewards')
                await tx.wait();
                addTransaction(tx, { summary: 'Claim FurFi and LP rewards'})
                toast.success('Claimed FurFi and LP rewards successfully', {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, 'Faild to claim FurFi and LP rewards');
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        } else if (strategy === Strategy.standardStrategy) {
            let tx: any;
            try {
                tx = await strategyContract.standardStrategyClaimFurFi();
                fetchPendingTransaction(tx.hash, 'Claim FurFi rewards')
                await tx.wait();
                addTransaction(tx, { summary: 'Claim FurFi rewards'})
                toast.success('Claimed FurFi rewards successfully', {theme:"colored"})

            } catch (err: any) {
                const errorText = getErrorText(err, 'Faild to claim FurFi rewards');
                toast.error(errorText, {theme:"colored"})
            } finally {
                if (tx) {
                    clearPendingTransaction(tx.hash);
                }
            }
        }
    }, [strategyContract, addTransaction]);
    return { onClaimRewards: handleClaimRewards };
};


export function useInvestInfo() {

    const abis = [FurfiStrategyABI, StandardStrategyABI, StablecoinStrategyABI];

    const { address: account } = useAccount();
    const allTransactions = useAllTransactions();

    const [info, setInfo] = useState<IInvestInfo[]>();

    const contractCallContext: ContractCallContext[] = strategies.map((strategy, index) => {
            const callPairs: ContractCallContext[] = [];
            pairs.forEach((pair) => {
                callPairs.push({
                    reference: `${pair + '/' + strategy}`,
                    contractAddress: addresses[pair][strategy][DEFAULT_CHAIN_ID],
                    abi: abis[index],
                    calls: [
                        { reference: 'getUpdatedStateData', methodName: 'getUpdatedStateData', methodParameters: [account] }
                    ]
                        
                } as ContractCallContext);
            });

            return callPairs;
        })
        .flatMap((callParam) => callParam);

    const fetchInvestInfo = useCallback(async () => {

        const data: ContractCallResults = await multicall.call(contractCallContext);
        const result: IInvestInfo[] = [];
        // console.log("data", data)
        if (data) {
            pairs.map((pair) => {
                strategies.forEach((strategy) => {
                    let _deposit = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][0].hex, 18);
                    if(Number(_deposit) > 0) {
                        let _data: IInvestInfo = {
                            pair,
                            strategy,
                            deposit: _deposit,
                            stakedInFurfi: '0',
                            pendingFurfiRewards: '0',
                            pendingLpRewards: '0',
                            reinvested: '0'
                        };
                        if (strategy === 'furfiStrategy') {
                            _data.pendingFurfiRewards = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][3].hex, 18);
                            _data.pendingLpRewards = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][4].hex, 18);
                            _data.stakedInFurfi = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][5].hex, 18);

                        } else if (strategy === 'stablecoinStrategy') {
                            _data.reinvested = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][2].hex, 18);

                        } else if (strategy === 'standardStrategy') {
                            _data.reinvested = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][2].hex, 18);
                            _data.pendingFurfiRewards = formatUnits(data.results[`${pair + '/' + strategy}`]['callsReturnContext'][0]['returnValues'][3].hex, 18);

                        }
                        result.push(_data);
                    }
                });
            });
        }
        setInfo(result);

    }, [contractCallContext, account, allTransactions]);

    useEffect(() => {
        if (account) fetchInvestInfo().catch((err) => console.log('Failed to fetch the invest info'));
    }, [ account, allTransactions]);


    return { investData: info };
}


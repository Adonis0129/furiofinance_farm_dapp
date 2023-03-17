import { createAction } from '@reduxjs/toolkit';

export interface SerializableTransactionReceipt {
    to: string;
    from: string;
    contractAddress: string;
    transactionIndex: number;
    blockHash: string;
    transactionHash: string;
    blockNumber: number;
    status?: number;
}

export const addTransaction = createAction<{
    chainId: number;
    hash: string;
    from: string;
    approval?: { tokenAddress: string; spender: string };
    summary?: string;
}>('transactions/addTransaction');

export const clearAllTransactions = createAction<{ chainId: number }>('transactions/clearAllTransactions');

export const finalizeTransaction = createAction<{
    chainId: number;
    hash: string;
    receipt: SerializableTransactionReceipt;
}>('transactions/finalizeTransaction');

export const checkedTransaction = createAction<{
    chainId: number;
    hash: string;
    blockNumber: number;
}>('transactions/checkedTransaction');



export const fetchPendingTransaction = createAction<{
    txnHash: string;
    summary: string;
}>('transactions/fetchPendingTransaction');

export const clearPendingTransaction = createAction<{
    txnHash: string;
}>('transactions/clearPendingTransaction');

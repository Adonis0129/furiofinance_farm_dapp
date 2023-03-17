import { createReducer } from '@reduxjs/toolkit';
import {
    addTransaction,
    checkedTransaction,
    clearAllTransactions,
    finalizeTransaction,
    SerializableTransactionReceipt,
    fetchPendingTransaction,
    clearPendingTransaction
} from './actions';

const now = () => new Date().getTime();

export interface IPendingTxn {
    txnHash: string;
    summary: string;
}
export interface TransactionDetails {
    hash: string;
    approval?: { tokenAddress: string; spender: string };
    summary?: string;
    receipt?: SerializableTransactionReceipt;
    lastCheckedBlockNumber?: number;
    addedTime: number;
    confirmedTime?: number;
    from: string;

}

export interface TransactionState {
    [chainId: number]: {
        [txHash: string]: TransactionDetails;
    },
    pendingTx: Array<IPendingTxn>;
}

export const initialState: TransactionState = { 0: {}, pendingTx: []};

export default createReducer(initialState, (builder) =>
    builder
        .addCase(addTransaction, (transactions, { payload: { chainId, from, hash, approval, summary } }) => {
            if (transactions[chainId]?.[hash]) {
                throw Error('Attempted to add existing transaction.');
            }
            const txs = transactions[chainId] ?? {};
            txs[hash] = { hash, approval, summary, from, addedTime: now() };
            transactions[chainId] = txs;
        })
        .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
            if (!transactions[chainId]) return;
            transactions[chainId] = {};
        })
        .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
            const tx = transactions[chainId]?.[hash];
            if (!tx) {
                return;
            }
            if (!tx.lastCheckedBlockNumber) {
                tx.lastCheckedBlockNumber = blockNumber;
            } else {
                tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
            }
        })
        .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
            const tx = transactions[chainId]?.[hash];
            if (!tx) {
                return;
            }
            tx.receipt = receipt;
            tx.confirmedTime = now();
        })
        .addCase(fetchPendingTransaction, (transactions, { payload: { txnHash, summary } }) => {
            const txs = transactions.pendingTx ?? [];
            txs.push( { txnHash, summary } );
            transactions.pendingTx = txs;
        })
        .addCase(clearPendingTransaction, (transactions, { payload: { txnHash } }) => {
            const txs = transactions.pendingTx ?? [];
            const target = txs.find(tx => tx.txnHash === txnHash);
            if (target) {
                txs.splice(txs.indexOf(target), 1);
            }
            transactions.pendingTx = txs;        
        }),
);

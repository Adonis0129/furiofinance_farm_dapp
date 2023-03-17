import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useNetwork, useAccount } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import ViewBase from './components/viewbase';
import Dashboard from './views/dashboard';
import Swap from './views/swap';
import Referral from './views/referral';
import Freezer from './views/freezer';
import Updaters from './state/Updaters';

import { Box, Modal } from '@mui/material';
import { usePendingTxns } from './state/transactions/hooks';
import { useClearAllTransactions } from './state/transactions/hooks';
import { BallTriangle  } from  'react-loader-spinner'

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
};

export default function App() {
    const { address } = useAccount();
    const pendingTransactions = usePendingTxns();
    const clearAllTransactions = useClearAllTransactions();

    useEffect(() => {
        if (!address) clearAllTransactions();
    }, [address]);

    
    return (
        <div>
            <Modal 
                open={pendingTransactions && pendingTransactions.length > 0}
                sx={{backdropFilter:'blur(10px)'}}
            >
                <Box sx={style}>
                    <BallTriangle 
                        height="150" 
                        width="100" 
                        radius="6"
                        color="#e77b3b"
                        // wrapperClass={{}}
                        // wrapperStyle=""
                        visible={true}
                    />
                </Box>
            </Modal>

            <BrowserRouter>
                <ToastContainer autoClose={3000} limit={3} pauseOnFocusLoss={false} />
                {/* <Updaters /> */}
                <ViewBase>
                    <Routes>
                        <Route path={'/'} element={<Dashboard />} />
                        <Route path={'/app'} element={<Dashboard />} />
                        <Route path={'/freezer'} element={<Freezer />} />
                        <Route path={'/swap'} element={<Swap />} />
                        <Route path={'/referral'} element={<Referral />} />
                    </Routes>
                </ViewBase>
            </BrowserRouter>
        </div>
    );
}

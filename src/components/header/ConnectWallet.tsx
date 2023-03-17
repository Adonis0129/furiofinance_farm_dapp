import React, { useCallback, useState, useEffect } from 'react'
import { useAccount } from 'wagmi';

// import { makeStyles } from '@mui/styles';
import { Button, Box, Typography, Modal, useMediaQuery } from '@mui/material'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { IconX } from '@tabler/icons'

import { formart } from 'src/helper/formatAddress';
import BNBLogo from 'src/asset/images/crypto-bnb.svg'
import MetamaskIcon from 'src/asset/images/metamask.svg'
import WalletConnectIcon from 'src/asset/images/walletconnect.svg'
import CoinbaseWalletIcon from 'src/asset/images/coinbasewallet.svg'
import useAuth from 'src/hooks/useAuth';
import { ConnectorNames } from 'src/config';


const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    background: 'linear-gradient(150deg,#102747 -87%,#102747)',
    // border: '1px solid #2e5387',
    boxShadow: 24,
    p: 4,
    borderRadius: '20px'
}

const buttonStyle = {
    border: '0px',
    borderRadius: '20px',
    backgroundImage: 'linear-gradient(90deg,#f8bf4c,#e77b3b)',
    color: '#fff',
    width: '200px',
    height: '50px',
    padding: '5px 10px',
    fontSize: '16px',
    fontFamily: 'Montserrat, sans-serif',
    textTransform: 'none',
    margin: '1px',
    '&:hover': {
        boxShadow: '0px 1px 4px #ccc',
   }
};

const wallets = [
    {
        logo: MetamaskIcon,
        name: 'Metamask',
        id: ConnectorNames.MetaMask

    }, {
        logo: WalletConnectIcon,
        name: 'Wallet Connect',
        id: ConnectorNames.WalletConnect
    }, {
        logo: CoinbaseWalletIcon,
        name: 'Coinbase Wallet',
        id: ConnectorNames.WalletLink
    }
]

function ConnectButton() {

    const [walletName, setWalletName] = useState('Metamask')
    const { isConnected, address } = useAccount();
    const { login, logout, loading } = useAuth();

    const [openModal1, setOpenModal1] = useState(false)
    const [openModal2, setOpenModal2] = useState(false)


    useEffect(() => {
        if (isConnected) {
            setOpenModal1(false);
        }
    }, [isConnected])

    return (
        <div>
            <Button
                startIcon={!isConnected ? <AccountBalanceWalletOutlinedIcon/> : <LockOpenOutlinedIcon/>}
                sx={buttonStyle}
                onClick={() => {
                    if (!isConnected) setOpenModal1(!openModal1)
                    else setOpenModal2(!openModal2)
                }}
            >
                {isConnected ? formart(address as string) : ' Connect Wallet'
                }
            </Button>
            <Modal
                open={openModal1}
                onClose={() => setOpenModal1(false)}
                sx={{backdropFilter:'blur(10px)'}}
            >
                <Box sx={{ ...modalStyle, width: { xs: '80%', md: '400px' } }}>
                    <Box
                        sx={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }}
                        onClick={() => setOpenModal1(false)}
                    >
                        <IconX color='#eee' />
                    </Box>
                    {
                        wallets.map((wallet, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    width: '100%',
                                    backgroundColor: 'hsla(0,0%,100%,.06)',
                                    padding: '20px',
                                    borderRadius: '15px',
                                    my: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                         boxShadow: '0px 1px 4px #ccc',
                                    }
                                }}
                                onClick={async () => {
                                    setWalletName(wallet.name)
                                    await login(wallet.id);
                                }}

                            >
                                <img src={wallet.logo} alt='walletlogo' style={{ width: '32px', height: '32px' }} />
                                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ lineHeight: '30px', px: 3, color: '#eee' }}>{wallet.name}</Typography>
                                    {
                                        loading && (walletName === wallet.name) &&
                                        <Typography color='#eee' sx={{ display: 'flex', alignItems: 'center' }}>
                                            <FiberManualRecordIcon color='info' sx={{ mr: 1 }} />
                                            connecting
                                        </Typography>
                                    }
                                </Box>
                            </Box>
                        ))
                    }
                </Box>
            </Modal>
            <Modal
                open={openModal2}
                onClose={() => setOpenModal2(false)}
                sx={{backdropFilter:'blur(10px)'}}
            >
                <Box sx={{ ...modalStyle, width: { xs: '80%', md: '400px' } }}>
                    <Box
                        sx={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }}
                        onClick={() => setOpenModal2(false)}
                    >
                        <IconX color='#eee' />
                    </Box>
                    <Typography variant="h5" component="h2" sx={{ textAlign: 'center', mb: 3, color: '#eee', textTransform: 'none' }}>
                        Log out
                    </Typography>
                    <Box display='flex' justifyContent='center'>
                        <Button
                            sx={{...buttonStyle}}
                            onClick={async () => {
                                setOpenModal2(false)
                                await logout();
                            }}
                        >
                            Disconnect
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    )
}

export default ConnectButton

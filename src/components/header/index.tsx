import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useSWR from 'swr';

import { IconMenu2 } from '@tabler/icons';
import { Divider, Typography, useMediaQuery, Avatar, Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { DATABASE_URL } from 'src/config';
import { trim } from 'src/helper/trim';
import FurioFinanceLogo from 'src/asset/images/furiofinance-logo.svg';
import FurFiLogo from 'src/asset/images/furfi-logo.svg';
import BNBLogo from 'src/asset/images/crypto-bnb.svg';
import ConnectButton from './ConnectWallet';

interface IHeader {
    handleDrawerToggle?: () => void;
}

const useStyles = makeStyles((theme) => ({
    topBar: {
        backgroundColor: 'transparent',
        width: '100%',
    },
    valuePanel: {
        padding: '8px 16px',
        display: 'flex',
        overflow: 'auto',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg,#0f1f2e,#e57a3b)',
        borderBottom: '1px solid #e57a3b',
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(191 131 70)',
        },
    },
}));

const titleStyle = {
    fontSize: '20px', 
    mx: '12px',
    color: 'white'
}
const activeTitleStyle = {
    fontSize: '20px', 
    mx: '12px',
    color: '#e77b3b'
}

function Header({ handleDrawerToggle }: IHeader) {
    const is960 = useMediaQuery('(max-width:960px)');
    const is768 = useMediaQuery('(max-width:768px)');
    const classes = useStyles();

    const { data } = useSWR(DATABASE_URL);
    const location = useLocation();
    const currentPath = location.pathname.split('/')[1];

    const bnbPrice = data?.bnbPrice ?? 0;
    const furFiPrice = data?.furFiPrice ?? 0;
    const tvl = data?.tvl ?? 0;

    return (
        <div className={classes.topBar}>
            <Box className={classes.valuePanel}>
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{ 
                        '& .MuiBox-root': { display: 'flex', alignItems: 'center', mx: '8px',  },
                            '& .MuiTypography-root': {
                                fontSize: '14px',
                                fontFamily: 'Montserrat, sans-serif',
                                color: 'white',
                                whiteSpace: 'nowrap'
                            },
                    }}
                >
                    <Box>
                        <img src={FurFiLogo} alt="furfi" style={{ width: '20px', height: '20px' }} />
                        <Typography mr={1}>FURFi Price : </Typography>
                        <Typography>
                            {!furFiPrice ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                            ) : (
                                <>{trim(furFiPrice, 2)}$</>
                            )}
                        </Typography>
                    </Box>
                    <Box>
                        <img src={BNBLogo} alt="bnb" style={{ width: '20px', height: '20px' }} />
                        <Typography mr={1}>BNB Price : </Typography>
                        <Typography>
                            {!bnbPrice ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                            ) : (
                                <>{trim(bnbPrice, 2)}$</>
                            )}
                        </Typography>
                    </Box>
                    <Box>
                        <Divider orientation="vertical" sx={{ bgcolor: '#FFF' }} />
                        <Typography mr={1}>TVL: </Typography>
                        <Typography>
                            {!tvl ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                            ) : (
                                <>{trim(tvl, 2)}$</>
                            )}
                        </Typography>
                    </Box>
                </Box>
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                        '& .MuiTypography-root': {
                            paddingLeft: '16px',
                            fontSize: '14px',
                            fontFamily: 'Montserrat, sans-serif',
                            color: 'white',
                        },
                    }}
                >
                    <a href="https://app.furio.io" target="blank">
                        <Typography>Furio</Typography>
                    </a>
                    <a href="https://furiofinance.furio.io" target="blank">
                        <Typography>FurioFinance</Typography>
                    </a>
                    <a href="https://furio.io" target="blank">
                        <Typography>Website</Typography>
                    </a>
                </Box>
            </Box>
            {is960 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                    }}
                >
                    <NavLink to="/">
                        <img src={FurioFinanceLogo} alt="appLogo" style={{ width: '170px', height: '' }} />
                    </NavLink>
                    <Box onClick={handleDrawerToggle}>
                        <IconMenu2 color="#e57a3b" style={{ width: '40px', height: '40px' }} />
                    </Box>
                </Box>
            )}
            {!is960 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 8,
                        py: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            // '& .MuiTypography-root': {
                            //     mx: 1,
                            //     fontSize: '20px',
                            // },
                        }}
                    >
                        <NavLink to="/">
                            <img
                                src={FurioFinanceLogo}
                                alt="appLogo"
                                style={{ width: '200px', height: '', marginRight: '24px' }}
                            />
                        </NavLink>
                        <NavLink to="/app">
                            {currentPath === 'app' ? (
                                <Typography sx={activeTitleStyle} >App</Typography>
                            ) : (
                                <Typography sx={titleStyle}>App</Typography>
                            )}
                        </NavLink>
                        <NavLink to="/referral">
                            {currentPath === 'referral' ? (
                                <Typography sx={activeTitleStyle} >Referral</Typography>
                            ) : (
                                <Typography sx={titleStyle}>Referral</Typography>
                            )}
                        </NavLink>
                        <NavLink to="/freezer">
                            {currentPath === 'freezer' ? (
                                <Typography sx={activeTitleStyle} >Freezer</Typography>
                            ) : (
                                <Typography sx={titleStyle}>Freezer</Typography>
                            )}
                        </NavLink>
                    </Box>
                    <Box>
                        <ConnectButton />
                    </Box>
                </Box>
            )}
        </div>
    );
}

export default Header;

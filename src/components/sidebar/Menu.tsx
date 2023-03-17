import React from 'react'
import { Box, Link, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { NavLink, useLocation } from 'react-router-dom';

import FurioFinanceLogo from 'src/asset/images/furiofinance-logo.svg';
import ConnectButton from '../header/ConnectWallet'

const useStyles = makeStyles(theme => ({
    // menuList: {
    //     '& .MuiTypography-root': {
    //         color: '#FFF',
    //         fontSize: '18px',
    //         fontWeight: 400,
    //         lineHeight: '30px'
    //     }
    // }
}))

const titleStyle = {
    color: '#FFF',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '30px'
}
const activeTitleStyle = {
    color: '#e77b3b',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '30px'
}

const menuList = [
    {
        title: 'App'
    }, {
        title: 'Referral'
    }, {
        title: 'Freezer'
    }
]

function MenuList() {
    const classes = useStyles()
    const location = useLocation();
    const currentPath = location.pathname.split('/')[1];

    return (
        <div>
            <div>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <img src={FurioFinanceLogo} alt="appLogo" style={{ width: '200px', height: '', paddingTop: '65px', paddingBottom: '50px'}} />
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <ConnectButton/>
                </Box>
                <Box sx={{ mt: 5 }}>
                {
                    menuList?.map((item, index) => (
                        <Link
                            key={index}
                            component={NavLink}
                            to={`${item.title.toLocaleLowerCase()}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt: 1,
                                borderRadius: '15px',
                                textDecoration: 'none'
                            }}
                        >
                            {currentPath === `${item.title.toLocaleLowerCase()}` ? (
                                <Typography sx={activeTitleStyle} >{item.title}</Typography>
                            ) : (
                                <Typography sx={titleStyle}>{item.title}</Typography>
                            )}
                        </Link>
                    ))
                }
            </Box >
            </div>
        </div >
    )
}

export default MenuList

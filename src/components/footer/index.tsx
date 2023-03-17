import React from 'react'
import useSWR from 'swr'

import { makeStyles } from '@mui/styles'
import { Box, Typography, Divider, Button, Skeleton, useMediaQuery } from '@mui/material'

import { DATABASE_URL } from 'src/config'
import { trim } from 'src/helper/trim'

import CoinmarketcapIcon from 'src/asset/images/coinmarketcap.png'
import CoinGeckoIcon from 'src/asset/images/coingecko.png'
import DappraderIcon from 'src/asset/images/dappradar.png'
import DappIcon from 'src/asset/images/dapp.png'
import TwitterIcon from 'src/asset/images/twitter.svg'
import TelegramIcon from 'src/asset/images/telegram.svg'
import DiscordIcon from 'src/asset/images/discord.svg'
import YoutubeIcon from 'src/asset/images/youtube.svg'
import MediumIcon from 'src/asset/images/medium.svg'
import FacebookIcon from 'src/asset/images/facebook.svg'
import InstagramIcon from 'src/asset/images/instagram.svg'
import FurfiIcon from 'src/asset/images/furfi-logo.svg'
import SolidityIcon from 'src/asset/images/solidity-banner.svg'


const useStyles = makeStyles((theme) => ({
    footerView: {
        '& .MuiTypography-root': {
            color: '#FFF'
        },
        '& .MuiButton-root': {
            color: '#FFF',
            borderRadius: '20px',
            // padding: '0 20px',
            background: 'linear-gradient(0deg,#f8bf4c,#e77b3b)',
        }
    },
    imageView: {
        filter: 'invert(58%) sepia(100%) saturate(186%) hue-rotate(177deg) brightness(84%) contrast(100%)',
        '& :hover': {
            filter: 'none',
            cursor: 'pointer',
        },
    }
}))

function Footer() {
    const classes = useStyles()

    const { data } = useSWR(DATABASE_URL)
    const furFiPrice = data?.furFiPrice

    return (
        <div className={classes.footerView}>
            <Box>
                <Divider sx={{ bgcolor: '#193855', width: '100%', mx: 'auto' }} />
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    p: 3,
                    img: {
                        width: '200px',
                        height: '60px'
                    }
                }}>
                    <img src={CoinmarketcapIcon} alt='coinmarketcap' />
                    <img src={CoinGeckoIcon} alt='coingecko' />
                    <img src={DappraderIcon} alt='coinmarketcap' />
                    <img src={DappIcon} alt='dapp' />
                </Box>
                <Divider sx={{ bgcolor: '#193855', width: '100%', mx: 'auto' }} />
            </Box>
            <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', my: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexDirection: 'column',
                    width: '400px',
                    height: '200px',
                    borderRadius: '20px',
                    bgcolor: '#102747',
                    m: 2,
                    pt:2
                }}>
                    <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-around' }}>
                        <Box display='flex'>
                        <img src={FurfiIcon} alt='logo' style={{ width: '55px', height: '55px'}} />
                            <Box sx={{ mx: 2 }}>
                                <Typography>$FURFI</Typography>
                                <Typography>
                                {!furFiPrice ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                            ) : (
                                <>{trim(furFiPrice, 2)}$</>
                            )}
                            </Typography>
                            </Box>
                        </Box>
                        <Button sx={{padding:'6px 12px'}}>
                            Buy $FURFI
                        </Button>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        m: 2,
                        '& img': {
                            width: 32,
                            height: 32,
                            m: 1
                        }
                    }}>
                        <img src={TwitterIcon} alt='twitter' />
                        <img src={TelegramIcon} alt='telegram' />
                        <img src={DiscordIcon} alt='discord' />
                        <img src={MediumIcon} alt='medium' />
                        <img src={YoutubeIcon} alt='youtube' />
                        <img src={FacebookIcon} alt='fecebook' />
                        <img src={InstagramIcon} alt='instagram' />
                    </Box>
                </Box>
                <Box sx={{ m: 2 }}>
                    <Typography sx={{ fontSize: '26px', mt: 2 }}>Useful Links</Typography>
                    <Box sx={{ display: 'flex' }}>
                        <Box sx={{ mr: 2, '& .MuiTypography-root': { py: '3px' } }}>
                            <Typography>How it works</Typography>
                            <Typography>FurioFinance Vaults</Typography>
                            <Typography>FURFi Swap</Typography>
                            <Typography>Referral</Typography>
                            <Typography>Rewards</Typography>
                        </Box>
                        <Box sx={{ ml: 2, '& .MuiTypography-root': { py: '3px' } }}>
                            <Typography>Taxes</Typography>
                            <Typography>Anti Dump</Typography>
                            <Typography>Fast Programme</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column', m: 2 }}>
                    <Box mb={3}>
                        <Typography sx={{ fontSize: '26px' }}>Contact Us</Typography>
                        <Typography>info@furfi.io</Typography>
                    </Box>
                    <img src={SolidityIcon} alt='solidity' style={{width:'170px', height:'47px'}}/>
                </Box>
            </Box>

        </div>
    )
}

export default Footer

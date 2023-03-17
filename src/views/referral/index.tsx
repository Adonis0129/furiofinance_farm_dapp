import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import QrCode from 'react-qr-code'
import { useAccount } from 'wagmi'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { makeStyles } from '@mui/styles'
import { Button, Divider, Typography, Skeleton } from '@mui/material'
import { Box } from '@mui/system'

import useReferral from 'src/hooks/useReferral'
import { trim } from 'src/helper/trim'

const useStyles = makeStyles((theme) => ({
    referralView: {
        display: 'flex',
        justifyContent: "space-around",
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '50px',
        marginBottom: '50px',
        '& .MuiTypography-root': {
            color: '#FFF'
        },
        '& .MuiButton-root': {
            color: '#FFF',
            backgroundColor: '#0f3152',
            borderRadius: '10px',
            padding: '10px'
        },
        [theme.breakpoints.down('md')]: {
            width: '95%',
            flexDirection: 'column',
            alignItems: 'center'
        }
    },
    referralCard: {
        minWidth: '320px',
        padding: '20px 30px',
        // border: '1px solid #193855',
        background: 'linear-gradient(150deg,#102747 -87%,#102747)',
        borderRadius: '20px',
        [theme.breakpoints.down('sm')]: {
            minWidth: '95%',
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    }
}))

function Referral() {
    const classes = useStyles()
    const { address, isConnected } = useAccount();

    const [qr, setQr] = useState('http://185.53.46.150:3000/')
    const [referralLink, setReferralLink] = useState('http://185.53.46.150:3000/')

    useEffect(() => {
        if (isConnected && address) {
            setQr(`http://185.53.46.150:3000/?referrer=${address}`)
            setReferralLink(`http://185.53.46.150:3000/?referrer=${address}`)
        }
    }, [address])

    const { friends, totalEarning, pendingRewards, claim } = useReferral()

    const onClaim = () => {
        if(Number(pendingRewards) <= 0 ) { 
            toast.warn("You have no rewards available", {theme:"colored"})
            return;
        }
        claim();
        return;
    }  

    return (
        <div className={classes.referralView}>
            <Box sx={{ display: 'flex', justifyContent: 'center', m: 3,  width: { xs: '90%', md: '50%' } }}>
                <Box>
                    <Typography sx={{ fontSize: '32px' }}>Invite Your Friends.</Typography>
                    <Typography sx={{ fontSize: '32px', mb: 2 }}>Earn Together</Typography>
                    <Typography sx={{ fontSize: '20px' }}>Earn a 1% commission of the Furfi minted <br />for your friends</Typography>
                </Box>
            </Box>
            <Box sx={{ width: { xs: '70%', md: '500px'} }}>
                <Box className={classes.referralCard}>
                    <Typography sx={{ fontSize: '24px', mb: 2 }}>My Referral Link</Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#0d1b2e9f',
                        p: 3,
                        border: '1px solid #2e5387',
                        borderRadius: '20px'
                    }}>
                        <Typography sx={{ width: '90%', overflow: 'hidden' }}>{referralLink}</Typography>
                        <CopyToClipboard text={referralLink}>
                            <Button sx={{ ml: 3 }}>Copy</Button>
                        </CopyToClipboard>
                    </Box>
                    <Divider sx={{ my: 3, bgcolor: '#2e5387' }} />
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <Typography sx={{ mb: 2 }}>Referral QR Code</Typography>
                        <QrCode
                            value={qr}
                            bgColor='#FFF'
                            fgColor='#000'
                            size={150}
                        />
                    </Box>
                    <Divider sx={{ my: 3, bgcolor: '#2e5387' }} />
                    <Box sx={(theme) => ({
                        display: 'flex',
                        justifyContent: 'space-around',
                        [theme.breakpoints.down('md')]: {
                            flexDirection: 'column'
                        },
                        '& .MuiBox-root': {
                            mx: 2,
                            mb: 1,
                            [theme.breakpoints.down('md')]: {
                                display: 'flex',
                                justifyContent: 'space-between'
                            }
                        }
                    })}>
                        <Box>
                            <Typography>Active friends</Typography>
                            {!address ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                <Typography>{friends}</Typography>
                            )}
                        </Box>
                        <Box>
                            <Typography>Total Earned</Typography>
                            {!address ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                <Typography>{trim(totalEarning, 2)} FURFI</Typography>
                            )}
                        </Box>
                        <Box>
                            <Typography>Claimable</Typography>
                            {!address ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                <Typography>{trim(pendingRewards, 2)} FURFI </Typography>
                            )}
                        </Box>
                        <Button 
                            sx={{ mt: { xs: 1, md: 0 } }}
                            disabled={!address}
                            onClick={onClaim}
                        >
                            Claim
                        </Button>
                    </Box>
                </Box>
            </Box>
        </div >
    )
}

export default Referral

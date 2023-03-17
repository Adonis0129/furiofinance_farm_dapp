import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Slide from 'react-slick';
import { toast } from 'react-toastify';
import { useAccount, useBalance, useSigner } from 'wagmi';
import { formatUnits } from '@ethersproject/units';
import { makeStyles } from '@mui/styles';
import { Box, Typography, Button, Divider, Skeleton } from '@mui/material';

import useFreeze from 'src/hooks/useFreeze';
import { trim } from 'src/helper/trim';
import { formatDateFromSeconds } from 'src/helper/formatDate';

export interface IFreezeInfo {
    amount: string;
    periodIndex: string;
    freezingStartTime: string;
    furFiRewardMask: string;
    bnbRewardMask: string;
    claimedBnbRewards: string;
    claimedFurFiRewards: string;
    pendingFurFiRewards: string;
    pendingBnbRewards: string;
}

const useStyles = makeStyles((theme) => ({
    cardView: {
        minWidth: '320px',
        // border: '1px solid #193855',
        background: 'linear-gradient(150deg,#102747 -87%,#102747)',
        borderRadius: '20px',
        '& .MuiTypography-root': {
            color: '#FFF',
        },
        '& .MuiButton-root': {
            width: '100%',
            color: '#FFF',
            backgroundColor: '#0f3152',
            fontSize: '20px',
            padding: '20px 0',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
        },
    },
    egText: {
        color: '#999',
    },
}));

const slideSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
};

function CheckBox({ apr }) {
    const classes = useStyles();
    const { freezing, unfreeze, claimRewards } = useFreeze();

    return (
        <div className={classes.cardView}>
            {!freezing ? (
                <Box sx={{ '& > .MuiBox-root': { p: '30px 20px' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '20px' }}>Freezing</Typography>
                        <Typography sx={{ fontSize: '24px' }}>e.g 1.80</Typography>
                    </Box>
                    <Divider sx={{ bgcolor: '#2e5387' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography sx={{ mb: 4 }}>Time left</Typography>
                            <Typography>-</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ mb: 4 }}>Freezing For</Typography>
                            <Typography>-</Typography>
                        </Box>
                    </Box>
                    <Divider sx={{ bgcolor: '#2e5387' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Claimed Rewards</Typography>
                        <Typography>-</Typography>
                    </Box>
                    <Divider sx={{ bgcolor: '#2e5387' }} />
                    <Box
                        sx={{
                            '& .MuiBox-root': {
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 1,
                            },
                        }}
                    >
                        <Box>
                            <Typography>Base APR</Typography>
                            <Typography>86.09%</Typography>
                        </Box>
                        <Box>
                            <Typography>Multiplier</Typography>
                            <Typography>1.1x</Typography>
                        </Box>
                        <Box>
                            <Typography>Freezer APR</Typography>
                            <Typography>94.9%</Typography>
                        </Box>
                    </Box>
                    {/* <Button >Go Freeze</Button> */}
                </Box>
            ) :  (
                <Slide {...slideSettings}>
                    {freezing?.map((freezing, index) => (
                        <ClaimView
                            freezingInfo={freezing}
                            onClaim={() => claimRewards(index + 1)}
                            onUnfreeze={() => unfreeze(index + 1)}
                            key={index}
                            apr={apr}
                        />
                    ))}
                </Slide>
            )}
        </div>
    );
}

interface IClaimView {
    freezingInfo: IFreezeInfo;
    onClaim: () => void;
    onUnfreeze: () => void;
    key: number;
    apr: number;
}

const period = ['1 Month', '3 Months', '6 Months'];
const periodInseconds = [86400*30, 86400*30*3, 86400*30*6];
const multipliers = [1.1, 1.4, 1.7];


function ClaimView(props: IClaimView) {
    const dispatch = useDispatch();
    const { freezingInfo, onClaim, onUnfreeze, key: index, apr} = props;
    const { isConnected, address: account } = useAccount();


    const freezingAmt = formatUnits(freezingInfo.amount, 18);
    const claimedAmt = formatUnits(freezingInfo.claimedFurFiRewards, 18);
    const periodIndex = freezingInfo.periodIndex.toString();
    const startTime = freezingInfo.freezingStartTime.toString();
    const furfiRewards = trim(formatUnits(freezingInfo.pendingFurFiRewards, 18), 2);
    const bnbRewards = trim(formatUnits(freezingInfo.pendingBnbRewards, 18), 2);

    const multiplier = multipliers[Number(periodIndex)];

    const now = new Date();
    const nowInseconds = now.getTime() / 1000;
    const lockTimeInseconds = Number(startTime) + periodInseconds[periodIndex];
    const leftTimeInsconds = lockTimeInseconds <= nowInseconds ? 0 : lockTimeInseconds - nowInseconds;

    const onClaimRewards = () => {
        if (Number(furfiRewards) <= 0 && Number(bnbRewards) <= 0) {
            toast.warn("You have no rewards available", { theme: 'colored' });
            return;
        }
        onClaim();
        return;
    };

    return (
        <Box sx={{ '& > .MuiBox-root': { p: '30px 20px' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '20px' }}>Freezing</Typography>
                {!account ? (
                    <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                    ) : (
                    <Typography sx={{ fontSize: '24px' }}>{trim(freezingAmt, 2)} FURFI</Typography>
                )}
            </Box>
            <Divider sx={{ bgcolor: '#2e5387' }} />
            <Box >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ mb: '8px' }}>Time left</Typography>
                    {!account ? (
                        <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                        ) : (
                        <Typography textAlign="center">{formatDateFromSeconds(leftTimeInsconds)}</Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Freezing For</Typography>
                    {!account ? (
                        <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                        ) : (
                        <Typography textAlign="center">{period[periodIndex]}</Typography>
                    )}
                </Box>
            </Box>
            <Divider sx={{ bgcolor: '#2e5387' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Claimed Rewards</Typography>
                    {!account ? (
                        <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                        ) : (
                        <Typography>{trim(claimedAmt, 2)} FURFI</Typography>
                    )}
            </Box>
            <Divider sx={{ bgcolor: '#2e5387' }} />
            <Box
                sx={{
                    '& .MuiBox-root': {
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: '8px',
                    },
                }}
            >
                <Box>
                    <Typography>Base APR</Typography>
                    <Typography>{trim(apr, 2)}%</Typography>
                </Box>
                <Box>
                    <Typography>Multiplier</Typography>
                    {!account ? (
                        <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                        ) : (
                        <Typography>{multiplier}x</Typography>
                    )}
                </Box>
                <Box>
                    <Typography>Freezer APR</Typography>
                    {!account ? (
                        <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                        ) : (
                        <Typography>{trim(apr * multiplier, 2)}%</Typography>
                    )}
                </Box>
            </Box>
            {leftTimeInsconds !== 0 ? (
                <Button
                    disabled={!account}
                    onClick={onClaimRewards}
                >
                    Claim Rewards: 
                    ({`${furfiRewards} FURFI, ${bnbRewards} BNB`})
                </Button>
            ) : (
                <Button 
                    disabled={!account}
                    onClick={onUnfreeze}
                >
                    Unfreeze and Claim: 
                    ({`${furfiRewards} FURFI, ${bnbRewards} BNB`})
                </Button>
            )}
        </Box>
    );
}

export default CheckBox;

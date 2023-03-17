import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import useSWR from 'swr';
import { toast } from 'react-toastify';

import { makeStyles } from '@mui/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, Typography, TextField, Skeleton } from '@mui/material';
import { Box } from '@mui/system';



import addresses from 'src/config/address';
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import { DATABASE_URL } from 'src/config';
import useStake from 'src/hooks/useStake';
import { trim } from 'src/helper/trim';
import FurfiLogo from 'src/asset/images/furfi-logo.svg';

const useStyles = makeStyles((theme) => ({
    cardView: {
        display: 'flex',
        minWidth: '320px',
        height: '245px',
        margin: '20px',
        borderRadius: '30px',
        // border: '1px solid #2e5387',
        background: 'linear-gradient(150deg,#102747 -87%,#102747)',
        '& .MuiTypography-root': {
            color: '#FFF',
        },
        [theme.breakpoints.down('sm')]: {
            minWidth: '95%',
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
}));

const enum ActionView {
    MAIN,
    ADD,
    REMOVE,
}

function StakingCard() {
    const classes = useStyles();

    const { isConnected, address: account } = useAccount();
    const { 
        stakedAmount, 
        pendingFurFiRewards, 
        pendingLPRewards, 
        totalStaked, 
        stake, 
        unstake, 
        claimRewards 
    } = useStake();

    const { data } = useSWR(DATABASE_URL);
    const furfiPrice = data?.furFiPrice ?? 0;
    const bnbPrice = data?.bnbPrice ?? 0;
    const LpPrice = data?.bnb_furfi_lp_Price ?? 0;
    const tvl = Number(totalStaked) * furfiPrice;
    const apr = data?.stakingPoolApr ?? 0;

    const { data: balance } = useBalance({
        addressOrName: account,
        token: addresses.furfi[DEFAULT_CHAIN_ID],
        watch: true,
    });


    const [stakeAmt, setStakeAmt] = useState<string>('');
    const [unstakeAmt, setUnstakeAmt] = useState<string>('');
    const [actionView, setActionView] = useState<ActionView>(ActionView.MAIN);

    const onSetStakeAmt = (e) => {
        if (e.target.value >= 0) setStakeAmt(e.target.value);
    };

    const onSetUnstakeAmt = (e) => {
        if (e.target.value >= 0) setUnstakeAmt(e.target.value);
    };

    const onStake = async () => {
        if(!account) { 
            toast.warn("Please connect wallet", {theme:"colored"})
            return;
        }
        if (Number(stakeAmt) <= 0 || Number(stakeAmt) > (balance?.formatted ?? 0)) {
            toast.warn('Invalid amount', { theme: 'colored' });
            return;
        }
        await stake(stakeAmt);
        return;
    };

    const onUnStake = async () => {
        if(!account) { 
            toast.warn("Please connect wallet", {theme:"colored"})
            return;
        }
        if (Number(unstakeAmt) <= 0 || Number(unstakeAmt) > Number(stakedAmount)) {
            toast.warn('Invalid amount', { theme: 'colored' });
            return;
        }
        await unstake(unstakeAmt);
        return;
    };

    const onClaim = async () => {
        if(!account) { 
            toast.warn("Please connect wallet", {theme:"colored"})
            return;
        }
        if(!stakedAmount) {
            setActionView(ActionView.ADD)
            return;
        }

        if ((Number(pendingFurFiRewards + pendingLPRewards)) <= 0) {
            toast.warn("You have no rewards available", { theme: 'colored' });
            return;
        }
        await claimRewards();
        return;
    };

    return (
        <div className={classes.cardView}>
            {actionView === ActionView.MAIN ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                    <Box sx={{ mt: 3, ml: 4 }}>
                        <Box display="flex" alignItems="center">
                            <img src={FurfiLogo} alt="furfi_logo" style={{ width: '32px', height: '32px' }} />
                            <Typography sx={{ fontSize: '20px', ml: 2 }}>FurFiStaking</Typography>
                        </Box>
                    </Box>
                    {!stakedAmount ? (
                        <Box>
                            <Box display="flex" justifyContent="space-around">
                                <Box>
                                    <Typography my={1}>Price</Typography>
                                    <Typography fontSize={'24px'}>${trim(furfiPrice, 2)}</Typography>
                                </Box>
                                <Box>
                                    <Typography my={1}>APR</Typography>
                                    <Typography fontSize={'24px'}>{trim(apr, 2)}%</Typography>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="space-between" width="100%">
                            <Box
                                sx={{
                                    width: '84%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    '& .MuiBox-root': {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        px: '16px',
                                        py: '4px'
                                    },
                                }}
                            >
                                <Box>
                                    <Box><Typography>Price</Typography></Box>
                                    <Box>
                                        {!account ? (
                                            <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                            ) : (
                                            <Typography >${trim(furfiPrice, 2)}</Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Box>
                                    <Box><Typography>Staked</Typography></Box>
                                    <Box>
                                        {!account ? (
                                            <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                            ) : (
                                            <Typography >{trim(stakedAmount, 2)} FURFI</Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Box>
                                    <Box><Typography>APR</Typography></Box>
                                    <Box><Typography>{trim(apr, 2)}%</Typography></Box>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    width:'16%',
                                    flexDirection: 'column',
                                    '& .MuiButton-root': {
                                        flexGrow: 1,
                                        bgcolor: '#0a172a9f',
                                        '&:hover': {
                                            bgcolor: '#0f3152',
                                        },
                                    },
                                }}
                            >
                                <Button onClick={() => setActionView(ActionView.ADD)}>
                                    <AddIcon sx={{ color: '#FFF' }} />
                                </Button>
                                <Button onClick={() => setActionView(ActionView.REMOVE)}>
                                    <RemoveIcon sx={{ color: '#FFF' }} />
                                </Button>
                            </Box>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex' }}>
                            <Button
                                sx={{
                                    flexGrow: 1,
                                    bgcolor: '#0f3152',
                                    color: '#FFF',
                                    borderBottomLeftRadius: '30px',
                                    borderBottomRightRadius: '30px',
                                    py: 2,
                                    '&:hover': {
                                        bgcolor: '#0f3152',
                                    },
                                }}
                                disabled={!account}
                                onClick={onClaim}
                            >
                                {
                                    !stakedAmount ? 'Stake' 
                                    : 'Claim Rewards ' + `${trim(pendingFurFiRewards, 2)} FURFI +` + `${ trim(Number(pendingLPRewards) * LpPrice / bnbPrice , 2)} BNB`
                                }
                            </Button>
                    </Box>
                </Box>
            ) : actionView === ActionView.ADD ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mx: 4 }}>
                        <Box display="flex" alignItems="center">
                            <img src={FurfiLogo} alt="furfi_logo" style={{ width: '32px', height: '32px' }} />
                            <Typography sx={{ fontSize: '20px', ml: 2 }}>FURFI</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center'}}>
                            <TextField
                                variant="standard"
                                InputProps={{
                                    disableUnderline: true,
                                    placeholder: 'e.g 1.83',
                                    type: 'number',
                                    inputProps: { min: 0 },
                                }}
                                sx={{ input: { color: '#FFF', fontSize: '20px', textAlign: 'right' } }}
                                onChange={onSetStakeAmt}
                                value={trim(stakeAmt, 8)}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            '& .MuiBox-root': {
                                display: 'flex',
                                justifyContent: 'space-between',
                                px: '18px',
                                py: '8px',
                            },
                        }}
                    >
                        <Box>
                            <Typography>Balance</Typography>
                                <Typography sx={{cursor: 'pointer', }}>{trim(balance?.formatted ?? 0, 2)}
                                    <Button 
                                        sx={{textTransform:'none', p: '0px', minWidth:'fit-content', mx:'4px'}} 
                                        onClick={() => {setStakeAmt(String(balance?.formatted ?? 0))}}
                                    >
                                         (Max) 
                                    </Button>
                                </Typography>
                        </Box>
                        <Box>
                            <Typography>Staked</Typography>
                            {!account ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                <Typography >{trim(stakedAmount, 2)} FURFI</Typography>
                            )}
                        </Box>
                        <Box>
                            <Typography>APR</Typography>
                            <Typography>{trim(apr, 2)}%</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                        <Button
                            sx={{
                                flexGrow: 1,
                                bgcolor: '#0f3152',
                                color: '#FFF',
                                display: 'flex',
                                justifyContent: 'center',
                                borderBottomLeftRadius: '30px',
                                py: 2,
                                '&:hover': {
                                    bgcolor: '#0f3152',
                                },
                            }}
                            disabled={!account}
                            onClick={onStake}
                        >
                            Stake
                        </Button>
                        <Button
                            sx={{
                                flexGrow: 1,
                                bgcolor: '#0a172a9f',
                                borderBottomRightRadius: '30px',
                                py: 2,
                                '&:hover': {
                                    color: '#FFF',
                                },
                            }}
                            onClick={() => setActionView(ActionView.MAIN)}
                        >
                            Back
                        </Button>
                    </Box>
                </Box>
            ) : (
                actionView === ActionView.REMOVE && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1}}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mx: 4  }}>
                            <Box display="flex" alignItems="center">
                                <img src={FurfiLogo} alt="furfi_logo" style={{ width: '32px', height: '32px' }} />
                                <Typography sx={{ fontSize: '20px', ml: 2 }}>FURFI</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    variant="standard"
                                    InputProps={{
                                        disableUnderline: true,
                                        placeholder: 'e.g 1.83',
                                        type: 'number',
                                        inputProps: { min: 0 },
                                    }}
                                    sx={{ input: { color: '#FFF', fontSize: '20px', textAlign: 'right' } }}
                                    onChange={onSetUnstakeAmt}
                                    value={trim(unstakeAmt, 8)}
                                />
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                '& .MuiBox-root': {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    px: '36px',
                                    py: '8px',
                                },
                            }}
                        >
                            <Box>
                                <Typography>Available</Typography>
                                {!account ? (
                                    <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                    ) : (
                                    <Typography sx={{cursor: 'pointer', }}>{trim(stakedAmount, 2)} FURFI
                                        <Button 
                                            sx={{textTransform:'none', p: '0px', minWidth:'fit-content', mx:'4px'}} 
                                            onClick={() => {setUnstakeAmt(stakedAmount)}}
                                        >
                                            (Max) 
                                        </Button>
                                    </Typography>
                                )} 
                            </Box>
                            <Box>
                                <Typography>APR</Typography>
                                <Typography>{trim(apr, 2)}%</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                            <Button
                                sx={{
                                    flexGrow: 1,
                                    bgcolor: '#0f3152',
                                    color: '#FFF',
                                    borderBottomLeftRadius: '30px',
                                    py: 2,
                                    '&:hover': {
                                        bgcolor: '#0f3152',
                                    },
                                }}
                                disabled={!account}
                                onClick={onUnStake}
                            >
                                Unstake
                            </Button>
                            <Button
                                sx={{
                                    flexGrow: 1,
                                    bgcolor: '#0a172a9f',
                                    borderBottomRightRadius: '30px',
                                    py: 2,
                                    '&:hover': {
                                        color: '#FFF',
                                    },
                                }}
                                onClick={() => setActionView(ActionView.MAIN)}
                            >
                                Back
                            </Button>
                        </Box>
                    </Box>
                )
            )}
        </div>
    );
}

export default StakingCard;

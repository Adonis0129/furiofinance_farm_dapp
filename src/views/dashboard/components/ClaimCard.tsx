import React, { useEffect, useState } from 'react';
import { isAddress } from '@ethersproject/address';
import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';
import { toast } from 'react-toastify';

import { makeStyles } from '@mui/styles';
import { Box, Typography, Button, Select, TextField, MenuItem, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import { DATABASE_URL } from 'src/config';
import { Strategy } from 'src/config';
import addresses from 'src/config/address';
import { tokens } from 'src/config/token';
import ERC20 from 'src/config/erc20';
import { trim } from 'src/helper/trim';
import { getDefaultProvider } from 'src/helper/provider';
import {
    useDepositFromEth,
    useDepositFromToken,
    useWithdrawToEth,
    useWithdrawToToken,
    useClaimRewards,
} from 'src/hooks/useInvest';
import useBalances from 'src/hooks/useBalances';
import { useReferrer } from 'src/state/application/hooks';

const useStyles = makeStyles((theme) => ({
    cardView: {
        display: 'flex',
        minWidth: '320px',
        height: '245px',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
export interface IInvestInfo {
    pair: string;
    strategy: string;
    deposit: string; //deposit
    stakedInFurfi: string; //staked in furfiStakingPool
    pendingFurfiRewards: string; //furfi
    pendingLpRewards: string; //furfiStrategy when FurFiBNBPrice > EfficiencyLevel
    reinvested: string; //standardStrategy and stablecoinStrategy
}

interface IProps {
    detail: IInvestInfo;
}

interface IToken {
    symbol: string;
    address: string;
    instance: ERC20;
}

const strategies = {
    furfiStrategy: 'FurfiStrategy',
    stablecoinStrategy: 'StablecoinStrategy',
    standardStrategy: 'StandardStrategy',
};

function ClaimCard(props: IProps) {
    const {
        pair,
        strategy,
        deposit: depositedAmount,
        stakedInFurfi,
        pendingFurfiRewards,
        pendingLpRewards,
        reinvested,
    } = props.detail;

    const [apy, setApy] = useState(0);

    const { data } = useSWR(DATABASE_URL);
    const furfiPrice = data?.furFiPrice ?? 0;
    const bnbPrice = data?.bnbPrice ?? 0;
    const lpPrice = data?.instances.find((item) => item.poolName === pair).lpPrice ?? 0;

    useEffect(() => {
        const pairInfo = data?.instances?.find((item) => item.poolName === pair);
        if (strategy === 'furfiStrategy') setApy(pairInfo.furfiStrategy.Apy ?? 0);
        else if (strategy === 'stablecoinStrategy') setApy(pairInfo.stablecoinStrategy.Apy ?? 0);
        else if (strategy === 'standardStrategy') setApy(pairInfo.standardStrategy.Apy ?? 0);
    }, [data]);

    const _strategy =
        strategy === 'furfiStrategy'
            ? Strategy.furfiStrategy
            : strategy === 'stablecoinStrategy'
            ? Strategy.stablecoinStrategy
            : Strategy.standardStrategy;

    const defaultProvider = getDefaultProvider();
    const classes = useStyles();
    const { data: signer } = useSigner();
    const { address: account } = useAccount();
    const { onDepositFromToken } = useDepositFromToken(pair, _strategy);
    const { onDepositFromEth } = useDepositFromEth(pair, _strategy);
    const { onWithdrawToToken } = useWithdrawToToken(pair, _strategy);
    const { onWithdrawToEth } = useWithdrawToEth(pair, _strategy);
    const { onClaimRewards } = useClaimRewards(pair, _strategy);
    const { balances } = useBalances();
    const referrer = useReferrer();

    const [actionView, setActionView] = useState<ActionView>(ActionView.MAIN);
    const [token, setToken] = useState<IToken>({
        symbol: 'BNB',
        address: addresses.bnb[DEFAULT_CHAIN_ID],
        instance: new ERC20(addresses.bnb[DEFAULT_CHAIN_ID], signer ?? defaultProvider, 'BNB'),
    });
    const [depositAmt, setDepositAmt] = useState<string>('');
    const [withdrawAmt, setWithdrawAmt] = useState<string>('');

    const tokenA = pair.split('_')[0];
    const tokenB = pair.split('_')[1];

    const onTokenChange = (e) => {
        const symbol = e.target.value;
        const tokenAddress = addresses[String(symbol).toLocaleLowerCase()][DEFAULT_CHAIN_ID] ?? '';
        if (isAddress(tokenAddress))
            setToken({
                ...token,
                symbol,
                address: tokenAddress,
                instance: new ERC20(tokenAddress, signer ?? defaultProvider, symbol),
            });
    };

    const onSetDepositAmount = (e) => {
        if (e.target.value >= 0) setDepositAmt(e.target.value);
    };

    const onSetWithdrawAmount = (e) => {
        if (e.target.value >= 0) setWithdrawAmt(e.target.value);
    };

    const handleClickDepositMax = () => {
        setDepositAmt(String(balances?.find((item) => item.tokenSymbol == token.symbol)?.balance));
    };

    const onInvest = async () => {
        if (!account) {
            toast.warn('Please connect wallet', { theme: 'colored' });
            return;
        }

        const balance = balances?.find((item) => item.tokenSymbol == token.symbol) ?? 0;

        if (Number(depositAmt) <= 0 || Number(depositAmt) > Number(balance)) {
            toast.warn('Invalid amount', { theme: 'colored' });
            return;
        }
        if (token.symbol === 'BNB') {
            await onDepositFromEth(depositAmt, referrer);
            return;
        } else {
            await onDepositFromToken(token.instance, depositAmt, referrer);
            return;
        }
    };

    const onWithdraw = async () => {
        if (!account) {
            toast.warn('Please connect wallet', { theme: 'colored' });
            return;
        }

        if (Number(withdrawAmt) <= 0 || Number(withdrawAmt) > Number(depositedAmount)) {
            toast.warn('Invalid amount', { theme: 'colored' });
            return;
        }
        if (token.symbol === 'BNB') {
            await onWithdrawToEth(withdrawAmt);
            return;
        } else {
            await onWithdrawToToken(token.instance, withdrawAmt);
            return;
        }
    };

    const onClaim = async () => {
        if (!account) {
            toast.warn('Please connect wallet', { theme: 'colored' });
            return;
        }

        if (Number(pendingFurfiRewards) <= 0) {
            toast.warn('You have no rewards available', { theme: 'colored' });
            return;
        }
        await onClaimRewards();
        return;
    };

    return (
        <div className={classes.cardView}>
            {actionView === ActionView.MAIN ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                    <Box sx={{ mt: 3, ml: 4 }}>
                        <Box display="flex" alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <img
                                    src={tokens[tokenA].logo}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '9999px',
                                        border: '1px solid yellow',
                                        backgroundColor: '#000',
                                    }}
                                />
                                <img
                                    src={tokens[tokenB].logo}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '20px',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '9999px',
                                        border: '1px solid yellow',
                                        backgroundColor: '#000',
                                    }}
                                />
                            </Box>
                            <Typography sx={{ fontSize: '20px', ml: 2 }}>{pair.toLocaleUpperCase()}</Typography>
                        </Box>
                    </Box>
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
                                    py: '4px',
                                },
                            }}
                        >
                            <Box>
                                <Box>
                                    <Typography>Strategy</Typography>
                                </Box>
                                <Box>
                                    <Typography>{strategies[strategy]}</Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Box>
                                    <Typography>Deposited</Typography>
                                </Box>
                                <Box>
                                    {!account ? (
                                        <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                    ) : (
                                        <Typography>${trim(Number(depositedAmount) * lpPrice, 2)}</Typography>
                                    )}
                                </Box>
                            </Box>
                            {strategy == 'furfiStrategy' ? (
                                <Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '16px' }}>StakedInFurFiPool</Typography>
                                    </Box>
                                    <Box>
                                        {!account ? (
                                            <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                        ) : (
                                            <Typography>{trim(stakedInFurfi, 2)} FURFI</Typography>
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Box>
                                    <Box>
                                        <Typography>Reinvested</Typography>
                                    </Box>
                                    <Box>
                                        {!account ? (
                                            <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                        ) : (
                                            <Typography>${trim(Number(reinvested) * lpPrice, 2)}</Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                width: '16%',
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
                    <Box sx={{ display: 'flex' }}>
                        <Button
                            sx={{
                                flexGrow: 1,
                                bgcolor: '#0f3152',
                                color: '#FFF',
                                borderBottomLeftRadius: '30px',
                                borderBottomRightRadius: '30px',
                                py: 2,
                            }}
                            disabled={!account || strategy == 'stablecoinStrategy'}
                            onClick={onClaim}
                        >
                            {strategy == 'furfiStrategy'
                                ? 'Claim FurFiStaking Rewards  ' +
                                  `${trim(pendingFurfiRewards, 2)} FURFI + ` +
                                  `${trim((Number(pendingLpRewards) * lpPrice) / bnbPrice, 2)} BNB`
                                : strategy == 'standardStrategy'
                                ? 'Claim Rewards ' + `${trim(pendingFurfiRewards, 2)} FURFI`
                                : '.'}
                        </Button>
                    </Box>
                </Box>
            ) : actionView === ActionView.ADD ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2, mr: 4 }}>
                        <Box sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                            <Select
                                value={token.symbol}
                                sx={{
                                    width: '120px',
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: 'white',
                                    },
                                }}
                                onChange={onTokenChange}
                            >
                                {Object.keys(tokens).map((item, index) => (
                                    <MenuItem
                                        key={index}
                                        value={tokens[item].symbol}
                                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                        <Box display="flex" alignItems="center">
                                            <img
                                                src={tokens[item].logo}
                                                alt="logo"
                                                style={{ width: '32px', height: '32px' }}
                                            />
                                            <Typography sx={{ ml: '8px' }}>{tokens[item].symbol}</Typography>
                                        </Box>
                                        {!account ? (
                                            <Skeleton
                                                sx={{ ml: '40px', bgcolor: 'grey.500' }}
                                                width="30px"
                                                height="25px"
                                            />
                                        ) : (
                                            <Typography sx={{ ml: '40px' }}>
                                                {trim(
                                                    balances?.find((i) => i.tokenSymbol == tokens[item].symbol)
                                                        ?.balance ?? 0,
                                                    2
                                                )}
                                            </Typography>
                                        )}
                                    </MenuItem>
                                ))}
                            </Select>
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
                                onChange={onSetDepositAmount}
                                value={trim(depositAmt, 8)}
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
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: '32px',
                                py: '5px',
                            },
                        }}
                    >
                        <Box>
                            <Typography>
                                {' '}
                                Balance : {''}
                                {trim(balances?.find((item) => item.tokenSymbol == token.symbol)?.balance ?? 0, 2)}
                                <Button
                                    sx={{ textTransform: 'none', p: '0px', minWidth: 'fit-content', mx: '4px' }}
                                    onClick={handleClickDepositMax}
                                >
                                    {' '}
                                    (Max){' '}
                                </Button>
                            </Typography>
                        </Box>
                        <Box>
                            <Typography>Deposited</Typography>
                            {!account ? (
                                <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                            ) : (
                                <Typography>${trim(Number(depositedAmount) * lpPrice, 2)}</Typography>
                            )}
                        </Box>
                        <Box>
                            <Typography>APY</Typography>
                            <Typography>{trim(apy, 2)}%</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                        {/* {(approveStatus === ApprovalState.UNKNOWN || approveStatus === ApprovalState.PENDING) ?} */}
                        <Button
                            sx={{
                                flexGrow: 1,
                                bgcolor: '#0f3152',
                                color: '#FFF',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderBottomLeftRadius: '30px',
                                py: 2,
                                '&:hover': {
                                    bgcolor: '#0f3152',
                                },
                            }}
                            // disabled={!account}
                            onClick={onInvest}
                        >
                            Invest {token.symbol}
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
                    <Box
                        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2, mr: 4 }}>
                            <Box sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                                <Select
                                    value={token.symbol}
                                    sx={{
                                        width: '120px',
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    }}
                                    onChange={onTokenChange}
                                >
                                    {Object.keys(tokens).map((item, index) => (
                                        <MenuItem
                                            key={index}
                                            value={tokens[item].symbol}
                                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                                        >
                                            <Box display="flex" alignItems="center">
                                                <img
                                                    src={tokens[item].logo}
                                                    alt="logo"
                                                    style={{ width: '32px', height: '32px' }}
                                                />
                                                <Typography sx={{ ml: '8px' }}>{tokens[item].symbol}</Typography>
                                            </Box>
                                            {!account ? (
                                                <Skeleton
                                                    sx={{ ml: '40px', bgcolor: 'grey.500' }}
                                                    width="30px"
                                                    height="25px"
                                                />
                                            ) : (
                                                <Typography sx={{ ml: '40px' }}>
                                                    {trim(
                                                        balances?.find((i) => i.tokenSymbol == tokens[item].symbol)
                                                            ?.balance ?? 0,
                                                        2
                                                    )}
                                                </Typography>
                                            )}
                                        </MenuItem>
                                    ))}
                                </Select>
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
                                    onChange={onSetWithdrawAmount}
                                    value={trim(withdrawAmt, 8)}
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
                                    px: '32px',
                                    py: '8px',
                                },
                            }}
                        >
                            <Box>
                                <Typography>Available</Typography>
                                <Typography>
                                    {trim(depositedAmount, 2)} LP (${trim(Number(depositedAmount) * lpPrice, 2)})
                                    <Button
                                        sx={{ textTransform: 'none', p: '0px', minWidth: 'fit-content', mx: '4px' }}
                                        onClick={() => setWithdrawAmt(depositedAmount)}
                                    >
                                        (Max)
                                    </Button>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography>APY</Typography>
                                <Typography>{trim(apy, 2)}%</Typography>
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
                                }}
                                // disabled={!account}
                                onClick={onWithdraw}
                            >
                                Withdraw to {token.symbol}
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

export function NoClaimCard() {
    const classes = useStyles();

    return (
        <div className={classes.cardView}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto' }}>
                <Button
                    sx={{
                        bgcolor: '#0f3152',
                        borderRadius: '20px',
                        boxShadow: 2,
                        p: 2,
                    }}
                >
                    <Typography>
                        Deposit assets in Stablecoin Pools <br /> to earn rewards
                    </Typography>
                </Button>
            </Box>
        </div>
    );
}

export default ClaimCard;

import React, {useState } from 'react';

import { useAccount, useSigner } from 'wagmi';
import { isAddress } from '@ethersproject/address';
import useSWR from 'swr';
import { toast } from 'react-toastify';

import {
    Box,
    Button,
    Divider,
    MenuItem,
    Modal,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Skeleton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

import addresses from 'src/config/address';
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import { Strategy } from 'src/config';
import ERC20 from 'src/config/erc20';
import { tokens } from 'src/config/token';
import { DATABASE_URL } from 'src/config';
import { trim } from 'src/helper/trim';
import { getDefaultProvider } from 'src/helper/provider';
import { useDepositFromEth, useDepositFromToken } from 'src/hooks/useInvest';
import useBalances from 'src/hooks/useBalances';
import { useReferrer } from 'src/state/application/hooks';


interface IProps {
    open: boolean;
    onClose: () => void;
    lp: string;
    apy: {
        furfiStrategy: number;
        standardStrategy: number;
        stablecoinStrategy: number;
    };
}

const modalStyle = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    overflow: 'auto',
    bgcolor: '#0a172a',
    boxShadow: 24,
    borderRadius: '20px',
    '& .MuiTypography-root': {
        color: '#FFF',
    },
    '& .subText': {
        color: '#bbb',
    },
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    '& .MuiToggleButtonGroup-grouped': {
        margin: '5px',
        flexGrow: 1,
        border: 0,
        textTransform: 'none',
        backgroundColor: '#0b2034',
        color: '#FFF',
        // padding: '15px 30px',
        '&.Mui-disabled': {
            border: 0,
        },
        '&:not(:first-of-type)': {
            borderRadius: '10px',
        },
        '&:first-of-type': {
            borderRadius: '10px',
        },
        '&:hover': {
            backgroundColor: '#0f3152',
        },
        '&.Mui-selected': {
            backgroundColor: '#0f3152',
            border: '1px solid #2e5387',
            color: '#FFF',
        },
        '&.Mui-selected:hover': {
            backgroundColor: '#0f3152',
            border: '1px solid #2e5387',
            color: '#FFF',
        },
        ['media']: {
            padding: '10px',
        },
    },
}));

interface IToken {
    symbol: string;
    address: string;
    instance: ERC20;
}

function InvestModal(props: IProps) {

    const { open, onClose, lp, apy } = props;

    const [strategy, setStrategy] = useState<Strategy>(Strategy.standardStrategy);
    
    const { address: account } = useAccount();
    const { data: signer } = useSigner();

    const defaultProvider = getDefaultProvider();
    const { onDepositFromToken } = useDepositFromToken(lp, strategy);
    const { onDepositFromEth } = useDepositFromEth(lp, strategy);
    const { balances } = useBalances();
    const referrer = useReferrer();

    const { data } = useSWR(DATABASE_URL);
    const bnbPrice = data?.bnbPrice ?? 0;

    const [token, setToken] = useState<IToken>({
        symbol: 'BNB',
        address: addresses.bnb[DEFAULT_CHAIN_ID],
        instance: new ERC20(addresses.bnb[DEFAULT_CHAIN_ID], signer ?? defaultProvider, 'BNB'),
    });
    const [amount, setAmount] = useState<string>('');


    const onSetStrategy = (e: React.MouseEvent<HTMLElement>, newStrategy: Strategy) => {
        if (newStrategy !== null) setStrategy(newStrategy);
    };

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

    const onSetAmount = (e) => {
        if (e.target.value >= 0) setAmount(e.target.value);
    };

    const handleClickMax = () => {
        setAmount(String(balances?.find(item => item.tokenSymbol == token.symbol)?.balance))
    }

    const onInvest = async () => {
        if(!account) { 
            toast.warn("Please connect wallet", {theme:"colored"})
            return;
        }

        const balance = balances?.find(item => item.tokenSymbol == token.symbol) ?? 0;

        if(Number(amount) <= 0 || Number(amount) > balance) { 
            toast.warn("Invalid amount", {theme:"colored"})
            return;
        }
        if (token.symbol === 'BNB') {
            await onDepositFromEth(amount, referrer)
            return;
        }else {
            await onDepositFromToken(token.instance, amount, referrer)
            return;
        }
    };

    return (
        <Modal 
            open={open}
            onClose={onClose}
            sx={{'& > .MuiBackdrop-root': {backdropFilter: 'blur(10px)'} }}
        >
            <Box sx={{ ...modalStyle }}>
                    <Box>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 4, mb: 3, px: 4 }}
                        >
                            <Typography sx={{ fontSize: '24px' }}>Add Liquidity</Typography>
                            <Box>
                                <CloseIcon
                                    sx={{ width: '32px', height: '32px', color: '#FFF', cursor: 'pointer' }}
                                    onClick={onClose}
                                />
                            </Box>
                        </Box>
                        <Divider sx={{ borderBottomColor: '#666' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 3, px: 4 }}>
                            <Box sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                                <Select
                                    value={token.symbol}
                                    sx={{
                                        width: '120px',
                                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', justifyContent:'space-between' },
                                        "& .MuiSvgIcon-root": {
                                            color: "white",
                                        },
                                    }}
                                    onChange={onTokenChange}
                                >
                                    {Object.keys(tokens).map((item, index) => (
                                        <MenuItem
                                            key={index} 
                                            value={tokens[item].symbol}
                                            sx={{display:'flex', justifyContent:'space-between'}}
                                        >
                                            <Box display='flex' alignItems='center'>
                                                <img
                                                    src={tokens[item].logo}
                                                    alt="logo"
                                                    style={{ width: '32px', height: '32px' }}
                                                />
                                                <Typography sx={{ml:'8px'}}>{tokens[item].symbol}</Typography>
                                            </Box>
                                            {!account ? <Skeleton sx={{ml:'40px', bgcolor: 'grey.500' }} width="30px" height="25px" />
                                                : <Typography sx={{ml:'40px'}}>{trim((balances?.find(i => i.tokenSymbol == tokens[item].symbol))?.balance ?? 0, 2)}</Typography>
                                            }
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
                                    onChange={onSetAmount}
                                    value={trim(amount, 8)}
                                />
                            </Box>
                        </Box>
                        <Box
                            sx={{ 
                                display: 'flex',
                                width:'fit-content', 
                                px: 6, 
                                mt: -4, 
                                mb: 2, 
                                alignItems: 'center', 
                                cursor: 'pointer' 
                            }}
                        >
                            <Typography mt={1} sx={{ color: '#FF0' }}>
                                Balance : {''}
                                {trim((balances?.find(item => item.tokenSymbol == token.symbol))?.balance ?? 0, 2)}
                                <Button sx={{textTransform:'none', p: '0px', minWidth:'fit-content', mx:'4px'}} onClick={handleClickMax}> (Max) </Button>
                            </Typography>
                        </Box>
                        <Divider sx={{ borderBottomColor: '#666' }} />
                        <Box sx={{ px: 4, my: 2 }}>
                            <Typography sx={{ fontSize: '18px', mb: 2 }}>Estimated Returns</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                <Box>
                                    <Typography>Monthly Income</Typography>
                                    <Typography>
                                        {trim(
                                            (Number(amount) * apy[strategy] * (token.symbol === 'BNB' ? bnbPrice : 1)) / 1200, 2
                                        )}$
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography>Yearly Income</Typography>
                                    <Typography>
                                        {trim(
                                            (Number(amount) * apy[strategy] * (token.symbol === 'BNB' ? bnbPrice : 1)) / 100, 2
                                        )}$
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography>APY</Typography>
                                    <Typography>{trim(apy[strategy], 2)}%</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Divider sx={{ borderBottomColor: '#666' }} />
                        <Box sx={{ px: 4, my: 2 }}>
                            <Typography sx={{ fontSize: '18px', mb: 2 }}>Choose Strategy</Typography>
                            <StyledToggleButtonGroup value={strategy} exclusive onChange={onSetStrategy}>
                                <ToggleButton value={Strategy.furfiStrategy}>FurfiStrategy</ToggleButton>
                                <ToggleButton value={Strategy.standardStrategy}>StandardStrategy</ToggleButton>
                                <ToggleButton value={Strategy.stablecoinStrategy}>StablecoinStrategy</ToggleButton>
                            </StyledToggleButtonGroup>
                            <Typography className="subText" sx={{ mt: 2, my: 1 }}>
                                {strategy == Strategy.furfiStrategy 
                                    ? `The majority of your rewards are paid out in Furfi token and automatically staked in the Furfi single staking pool. This creates the highest returns when the Furfi token price rises.`
                                    : strategy == Strategy.standardStrategy
                                        ? `The majority of your rewards are automatically re-invested into the pool, creating a daily compound effect. Part of your rewards are paid out in Furfi token.`
                                        : `All of your rewards are automatically re-invested into the two currencies of the pool creating a daily compound effect. You don’t get any Furfi tokens.`
                                }
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}></Box>
                        <Box
                            sx={{
                                display: 'grid',
                                // gridTemplateColumns: 'repeat(2, 1fr)',
                            }}
                        >
                            <Button
                                sx={{
                                    p: 3, 
                                    // border: '1px solid #0f3152',
                                    borderBottomLeftRadius: '20px',
                                    borderBottomRightRadius: '20px',
                                    color: '#FFF',
                                    bgcolor: '#0b2034',
                                    '&:hover': {
                                        bgcolor: '#0f3152'
                                    }
                                }}
                                disabled={!account}
                                onClick={onInvest}
                            >
                                Invest {token.symbol}
                            </Button>
                        </Box>
                    </Box>
            </Box>
        </Modal>
    );
}

export default InvestModal;

import {useMemo, useState } from 'react';
import { makeStyles } from '@mui/styles'
import { Box, Typography, Button, Divider, ToggleButtonGroup, ToggleButton, TextField } from '@mui/material'
import { styled } from '@mui/material/styles';
import { useAccount, useBalance } from 'wagmi'
import addresses from 'src/config/address'
import { toast } from 'react-toastify';

import TokenLogo from '../../../asset/images/furfi-logo.svg'
import { DEFAULT_CHAIN_ID } from 'src/config/chains';
import useFreeze from 'src/hooks/useFreeze';
import { trim } from 'src/helper/trim';

const useStyles = makeStyles((theme) => ({
    cardView: {
        minWidth: '320px',
        // border: '1px solid #193855',
        background: 'linear-gradient(150deg,#102747 -87%,#102747)',
        borderRadius: '20px',
        '& .MuiTypography-root': {
            color: '#FFF'
        },
    },
    egText: {
        color: '#999'
    },

}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    '& .MuiToggleButtonGroup-grouped': {
        margin: '5px',
        border: 0,
        textTransform: 'none',
        backgroundColor: '#0b2034',
        color: '#FFF',
        padding: '15px 30px',
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
            backgroundColor: '#0f3152'
        },
        '&.Mui-selected': {
            backgroundColor: '#0f3152',
            border: '1px solid #2e5387',
            color: '#FFF'
        },
        ['media']: {
            padding: '10px'
        }

    },
}));

interface IFreeze {
    apr: number
}

function FreezeBox({ apr }: IFreeze) {

    const classes = useStyles()

    const [period, setPeriod] = useState(0)
    const [amount, setAmount] = useState<string>('')
    const { freeze } = useFreeze()

    const multiplier = useMemo(() => {
        switch (period) {
            case 0: return 1.1
            case 1: return 1.4
            case 2: return 1.7
            default: return 1.1
        }
    }, [period])

    const onSetPeriod = (event: any, prd: number) => {
        if (prd !== null)
            setPeriod(prd)
    }

    const { address: account } = useAccount()
    const { data: balance } = useBalance({
        addressOrName: account,
        token: addresses.furfi[DEFAULT_CHAIN_ID],
        watch: true
    })

    const onSetAmount = (e) => {
            setAmount(e.target.value)
    }

    const onFreeze = () => {
        if(!account) { 
            toast.warn("Please connect wallet", {theme:"colored"})
            return;
        }
        if(Number(amount) <= 0 || Number(amount) > (balance?.formatted ?? 0)) { 
            toast.warn("Invalid amount", {theme:"colored"})
            return;
        }
        freeze(amount, period)
        return;
    }

    return (
        <div className={classes.cardView}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 3 }}>
                <Box >
                    <Box sx={{display:'flex', alignItems:'center'}}>
                        <img src={TokenLogo} alt='logo' style={{ width: '32px', height: '32px' }} />
                        <Typography sx={{ ml: 1 }}>FURFI</Typography>
                    </Box>
                    <Typography sx={{color: '#3498db', cursor: 'pointer'}}>Balance : {''}
                        {trim(Number(balance?.formatted ?? 0), 2)}
                        <Button 
                            sx={{textTransform:'none', p: '0px', minWidth:'fit-content', mx:'4px'}} 
                            onClick ={() => {setAmount(String(balance?.formatted ?? 0))}}
                        >
                            (Max) 
                        </Button>
                    </Typography>
                </Box>
                <Box>
                    <TextField
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            placeholder: 'e.g 1.83',
                            type: 'number',
                            inputProps: { min: 0 }
                        }}
                        value={trim(amount, 8)}
                        onChange={onSetAmount}
                        sx={{ input: { color: '#FFF', fontSize: '20px', textAlign: 'right' } }}
                    />
                </Box>
            </Box>
            <Divider sx={{ bgcolor: '#2e5387' }} />
            <Box sx={{ px: 4, py: 3 }}>
                <Typography sx={{ mb: 4 }}>Length of tenure : Max 6 months</Typography>
                <StyledToggleButtonGroup
                    exclusive
                    value={period}
                    onChange={onSetPeriod}
                >
                    <ToggleButton value={0}>1 month</ToggleButton>
                    <ToggleButton value={1}>3 months</ToggleButton>
                    <ToggleButton value={2}>6 months</ToggleButton>
                </StyledToggleButtonGroup>
            </Box>
            <Divider sx={{ bgcolor: '#2e5387' }} />
            <Box sx={{
                px: 4,
                py: 3,
                '& .MuiBox-root': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                }
            }}>
                <Box>
                    <Typography>Base APR</Typography>
                    <Typography>{trim(apr, 2)}%</Typography>
                </Box>
                <Box>
                    <Typography>Multiplier</Typography>
                    <Typography>{multiplier}x</Typography>
                </Box>
                <Box>
                    <Typography>Freezer APR</Typography>
                    <Typography>{trim(apr * multiplier, 2)}%</Typography>
                </Box>
            </Box>
            <Button 
                sx={{
                    width: '100%',
                    color: '#FFF',
                    backgroundColor: '#0f3152',
                    fontSize: '20px',
                    padding: '20px 0',
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px'
                }}
                disabled={!account}
                onClick={onFreeze}
            >
                Freeze
            </Button>
        </div>
    )
}

export default FreezeBox;
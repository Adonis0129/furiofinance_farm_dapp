import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { Link, Typography, Divider } from '@mui/material';
import { trim } from 'src/helper/trim';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const useStyles = makeStyles((theme) => ({
    detailsSectionView: {},
}));

const style = {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: '12px',
    marginRight: '12px',
    marginBottom: '4px',
};

interface IProps {
    apys: { 
        furfiStrategy: number;
        standardStrategy: number;
        stablecoinStrategy: number;
    };
    addresses: {
        furfiStrategy: string;
        standardStrategy: string;
        stablecoinStrategy: string;
    };
    efficiencyLevel: number;
}

function DetailsSection(props: IProps) {
    const classes = useStyles();

    const { apys, efficiencyLevel, addresses } = props;
    return (
        <div className={classes.detailsSectionView}>
            <Divider sx={{ backgroundColor: '#2e5387' }} />
            <Box sx={{marginTop: '16px', marginBottom: '16px'}}>
                <Box sx={style}>
                    <Typography> Furfi Strategy APY: </Typography>
                    <Typography> {trim(Number(apys.furfiStrategy), 2)}% </Typography>
                </Box>
                <Box sx={style}>
                    <Typography> Standard Strategy APY: </Typography>
                    <Typography> {trim(Number(apys.standardStrategy), 2)}% </Typography>
                </Box>
                <Box sx={style}>
                    <Typography> Stablecoin Strategy APY: </Typography>
                    <Typography> {trim(Number(apys.stablecoinStrategy), 2)}% </Typography>
                </Box>
                <Box sx={style}>
                    <Typography> Efficiency Level: </Typography>
                    <Typography> {efficiencyLevel} </Typography>
                </Box>
                {/* <Box sx={style}>
                    <Link
                        href={`https://testnet.bscscan.com/address/${addresses?.furfiStrategy}`}
                        underline="none"
                        target="_blank"
                    >
                        FurfiStrategy Contract
                        <OpenInNewIcon  fontSize='small' sx={{marginBottom: '-3px'}}/>
                    </Link>
                </Box>
                <Box sx={style}>
                    <Link
                        href={`https://testnet.bscscan.com/address/${addresses?.standardStrategy}`}
                        underline="none"
                        target="_blank"
                    >
                        StandardStrategy Contract
                        <OpenInNewIcon  fontSize='small' sx={{marginBottom: '-3px'}}/>
                    </Link>
                </Box>
                <Box sx={style}>
                    <Link
                        href={`https://testnet.bscscan.com/address/${addresses?.stablecoinStrategy}`}
                        underline="none"
                        target="_blank"
                    >
                        StablecoinStrategy Contract
                        <OpenInNewIcon  fontSize='small' sx={{marginBottom: '-3px'}}/>
                    </Link>
                </Box> */}
            </Box>
        </div>
    );
}

export { DetailsSection };

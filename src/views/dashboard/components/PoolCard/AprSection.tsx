import React, {useState} from 'react';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { Typography, Collapse } from '@mui/material';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import { trim } from 'src/helper/trim';


const useStyles = makeStyles((theme) => ({
    strategyView: {
        display: "flex",
        justifyContent:"space-between",
        alignItems: "center",
        paddingRight: '32px',
        paddingLeft: '32px',
        paddingTop:'8px',
        paddingBottom:'8px',
        color: 'white',
        '&:hover':{
            color:'#e74c3c'
        },
    },
    SectionView: {
        display: 'flex',
        justifyContent: 'space-between',
        '& .MuiTypography-root':{
            color: 'gray'
        }
    },

}));

export interface IAprDetail {
    strategy: string;
    apy: number;
    lpRewardsApr: number;
    blockRewardsApr: number;
    reinvestedRate: number;
    soldRate: number;
    soldAndStakedRate: number;
    goToFURFIStakersRate: number;
    goToDevsRate: number;
    additionalMintApr: number;
    additionalMintAndStakedApr: number;
    efficiencyLevel: number;
    furFiBnbPrice: number;
}

interface IProps {
    aprDetail : IAprDetail
}

function AprSection(props: IProps) {
    const classes = useStyles();
    const [openCollapse, setOpenCollapse] = useState(false);

    
    const { 
        strategy,
        apy,
        lpRewardsApr,
        blockRewardsApr,
        reinvestedRate,
        soldRate,
        soldAndStakedRate,
        goToFURFIStakersRate,
        goToDevsRate,
        additionalMintApr,
        additionalMintAndStakedApr,
        efficiencyLevel,
        furFiBnbPrice
    } = props.aprDetail

    const strategyText = strategy == 'furfiStrategy' 
        ? 'Furiofi Strategy' 
        : strategy == 'standardStrategy' 
            ? 'Standard Strategy' : 'Stablecoin Strategy'

    return (
        <div>
            <Box className={classes.strategyView} onClick={()=>{setOpenCollapse(!openCollapse)}}>
                <Typography>{strategyText}</Typography>
                <Box sx={{display: 'flex'}}>
                    <Typography>APY: {trim(apy, 2)}%</Typography>
                    <Box>
                        {openCollapse? <ExpandLessOutlinedIcon/> : <ExpandMoreOutlinedIcon/>}
                    </Box>
                </Box>
            </Box>
            <Collapse in={openCollapse} sx={{px: '32px'}}>
                <Box sx={{marginLeft:'16px'}}>
                    <Box className={classes.SectionView}>
                        <Typography> LP Rewards/Fee APR(reinvested) </Typography>
                        <Typography> {trim(lpRewardsApr, 2)}% </Typography>
                    </Box>
                    <Box className={classes.SectionView}>
                        <Typography> BlockRewards APR </Typography>
                        <Typography> {trim(blockRewardsApr, 2)}% </Typography>
                    </Box>
                    <Box sx={{marginLeft:'16px'}}>
                        { strategy != 'furfiStrategy'  &&
                            <Box className={classes.SectionView}>
                                <Typography> Reinvested ({reinvestedRate})% </Typography>
                                <Typography> {trim(blockRewardsApr * reinvestedRate / 100, 2)}% </Typography>
                            </Box>
                        }
                        { furFiBnbPrice >= efficiencyLevel && strategy == 'standardStrategy' && 
                            <Box className={classes.SectionView}>
                                <Typography> Sold for FURFI ({soldRate})% </Typography>
                                <Typography> {trim(blockRewardsApr * soldRate / 100 , 2)}% </Typography>
                            </Box>
                        }
                        { strategy == 'furfiStrategy' &&
                            <Box className={classes.SectionView}>
                                <Typography> Sold FurFi and Staked in FurFiStakingPool ({soldAndStakedRate})% </Typography>
                                <Typography> {trim(blockRewardsApr * soldAndStakedRate / 100, 2)}% </Typography>
                            </Box>
                        }
                        { furFiBnbPrice < efficiencyLevel && strategy != 'stablecoinStrategy' &&
                            <Box className={classes.SectionView}>
                                <Typography> Goes to FURFI Stakers ({goToFURFIStakersRate})% </Typography>
                                <Typography> {trim(blockRewardsApr * goToFURFIStakersRate / 100, 2)}% </Typography>
                            </Box>
                        }
                        <Box className={classes.SectionView}>
                            <Typography> Goes to Devs ({goToDevsRate})% </Typography>
                            <Typography> {trim(blockRewardsApr * goToDevsRate / 100, 2)}% </Typography>
                        </Box>
                    </Box>
                    { strategy == 'standardStrategy' &&
                        <Box className={classes.SectionView}>
                            <Typography> Minted in FURFI </Typography>
                            <Typography> {trim(additionalMintApr, 2)}% </Typography>
                        </Box>
                    }
                    { strategy == 'furfiStrategy' &&
                        <Box className={classes.SectionView}>
                            <Typography> Minted in FURFI ans staked in FURFI StakingPool </Typography>
                            <Typography> {trim(additionalMintAndStakedApr, 2)}% </Typography>
                        </Box>
                    }
                </Box>
            </Collapse>
        </div>
    );
}
export { AprSection };

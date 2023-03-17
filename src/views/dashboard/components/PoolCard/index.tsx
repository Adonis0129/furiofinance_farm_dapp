import React, { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import { makeStyles } from '@mui/styles'
import { Box, Button, Typography, Collapse } from '@mui/material'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

import { trim } from 'src/helper/trim'
import InvestModal from './InvestModal'
import AprModal from './AprModal'
import { ExpandableSectionButton } from './ExpandableSectionButton'
import { DetailsSection } from './DetailsSection'
import { IAprDetail } from './AprSection'
import { strategies, Strategy } from 'src/config'

const useStyles = makeStyles((theme) => ({
    cardView: {
        display: 'flex',
        minWidth: '320px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '20px',
        borderRadius: '30px',
        // border: '1px solid #2e5387',
        background: 'linear-gradient(150deg,#102747 -87%,#102747)',
        '& .MuiTypography-root': {
            color: '#FFF'
        },
        [theme.breakpoints.down('sm')]: {
            minWidth: '95%',
            marginLeft: 'auto',
            marginRight: 'auto'
        }
    }
}))

export interface IPoolCard {
    aTokenLogo: string;
    bTokenLogo: string;
    poolName: string;
    lp: string;
    lpPrice: string;
    tvl: number;
    efficiencyLevel: number;
    furFiBnbPrice: number;
    addresses: {
        furfiStrategy: string,
        standardStrategy: string,
        stablecoinStrategy: string
    }
    apy: {
        furfiStrategy: number,
        standardStrategy: number,
        stablecoinStrategy: number
    };
    lpRewardsApr: number;
    blockRewardsApr: {
        furfiStrategy: number,
        standardStrategy: number,
        stablecoinStrategy: number
    };
    additionalMintApr: number;
    additionalMintANdStakedApr: number;
}

interface IProps {
    poolInfo: IPoolCard
}

function PoolCard(props: IProps) {
    const classes = useStyles()
    const [openInvestModal, setOpenInvestModal] = useState(false)
    const [openAprModal, setOpenAprModal] = useState(false)
    const [showExpandableSection, setShowExpandableSection] = useState(false);
    const handleChange = () => {
        setShowExpandableSection((prev) => !prev);
      };

    const {
        aTokenLogo,
        bTokenLogo,
        poolName,
        lp,
        lpPrice,
        tvl,
        addresses,
        apy,
        lpRewardsApr,
        blockRewardsApr,
        additionalMintApr,
        additionalMintANdStakedApr,
        efficiencyLevel,
        furFiBnbPrice,
    } = props.poolInfo


    const aprDetails : IAprDetail[] = 
        strategies.map((strategy)=>{
            let _reinvestedRate = 0;
            let _soldRate = 0
            let _soldAndStakedRate = 0;
            let _goToFURFIStakersRate = 0;
            let _goToDevsRate = 0;
            let _additionalMintApr = 0;
            let _additionalMintAndStakedApr = 0;
            if(strategy == 'furfiStrategy') {
                if(furFiBnbPrice >= efficiencyLevel){
                    _soldAndStakedRate = 94;
                    _goToDevsRate = 6;
                    _additionalMintAndStakedApr = additionalMintANdStakedApr;
                }
                else{
                    _soldAndStakedRate = 70;
                    _goToFURFIStakersRate = 24;
                    _goToDevsRate = 6;
                    _additionalMintAndStakedApr = additionalMintANdStakedApr;
                }
            }
            if(strategy == 'standardStrategy') {
                if(furFiBnbPrice >= efficiencyLevel){
                    _reinvestedRate = 70;
                    _soldRate = 24;
                    _goToDevsRate = 6;
                    _additionalMintApr = additionalMintApr;
                }
                else{
                    _reinvestedRate = 70;
                    _goToFURFIStakersRate = 24;
                    _goToDevsRate = 6;
                    _additionalMintApr = additionalMintApr;
                }
            }
            if(strategy == 'stablecoinStrategy') {
                _reinvestedRate = 97;
                _goToDevsRate = 3;
            }

            return{
                strategy: strategy,
                apy: apy[strategy],
                lpRewardsApr: lpRewardsApr,
                blockRewardsApr: blockRewardsApr[strategy],
                reinvestedRate: _reinvestedRate,
                soldRate: _soldRate,
                soldAndStakedRate: _soldAndStakedRate,
                goToFURFIStakersRate: _goToFURFIStakersRate,
                goToDevsRate: _goToDevsRate,
                additionalMintApr: _additionalMintApr,
                additionalMintAndStakedApr: _additionalMintAndStakedApr,
                efficiencyLevel: efficiencyLevel,
                furFiBnbPrice: furFiBnbPrice
            }
        }) ?? []
    
    const { address: account } = useAccount();

    return (
        <div className={classes.cardView}>
            <Box display='flex' alignItems='center' sx={{ mt: 4, ml: 4 }}>
                <Box sx={{ position: 'relative' }}>
                    <img 
                        src={aTokenLogo} 
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '9999px',
                            border: '1px solid yellow',
                            backgroundColor: '#000',
                        }} 
                    />
                    <img
                        src={bTokenLogo}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '20px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '9999px',
                            border: '1px solid yellow',
                            backgroundColor: '#000'
                        }}
                    />
                </Box>
                <Box ml={3}>
                    <Typography sx={{ fontSize: '20px' }}>{poolName}</Typography>
                </Box>
            </Box>
            <Box display='flex' justifyContent='space-around' marginBottom={4}>
                <Box >
                    <Typography my={1}>APY</Typography>
                    <Box sx={{display:'flex', alignItems:'center'}}>
                        <Typography fontSize={'24px'}>{trim(apy.standardStrategy, 2)}%</Typography>
                        <Box 
                            sx={{
                                display:'flex', 
                                alignItems:'center', 
                                color: 'gray', 
                                marginLeft: '4px',
                                '&:hover':{
                                    color:'white',
                                    cursor:'pointer'
                                }
                            }}
                            onClick={() => {setOpenAprModal(true)}}
                        >
                            <HelpOutlineOutlinedIcon />
                        </Box>
                    </Box>
                </Box>
                <Box>
                    <Typography my={1}>Price</Typography>
                    <Typography fontSize={'24px'}>${trim(lpPrice, 2)}</Typography>
                </Box>
            </Box>
            <Collapse  in={showExpandableSection}>
                <DetailsSection 
                    apys={apy}
                    efficiencyLevel={efficiencyLevel}
                    addresses={addresses}
                />
            </Collapse>
            <Box display='flex' >
                <Button
                    sx={{
                        flexGrow: 1,
                        bgcolor: '#0f3152',
                        color: '#FFF',
                        borderBottomLeftRadius: '30px',
                        py: 2
                    }}
                    // disabled={!account}
                    onClick={() => {setOpenInvestModal(true)}}
                >
                    Invest
                </Button>
                <ExpandableSectionButton
                    onClick={handleChange}
                    expanded={showExpandableSection}
                />
            </Box>
            <InvestModal open={openInvestModal} onClose={() => setOpenInvestModal(false)} lp={lp} apy={apy} />
            <AprModal aprDetails={aprDetails}  open={openAprModal} onClose={()=> setOpenAprModal(false)}/>
        </div>
    )
}

export default PoolCard

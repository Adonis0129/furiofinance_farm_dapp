import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import Slider from 'react-slick';

import { makeStyles } from '@mui/styles';
import { Divider, Typography, Skeleton, Button } from '@mui/material';
import { Box } from '@mui/system';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { addReferrer } from '../../state/application/actions';
import { useInvestInfo } from 'src/hooks/useInvest';
import { tokens } from 'src/config/token';
import { DATABASE_URL } from 'src/config';
import { trim } from 'src/helper/trim';
import StakingCard from './components/StakingCard';
import ClaimCard, { NoClaimCard } from './components/ClaimCard';
import PoolCard, { IPoolCard } from './components/PoolCard';

const useStyles = makeStyles((theme) => ({
    dashboardView: {
        display: 'flex',
        justifyContent: 'center',
        '& .MuiTypography-root': {
            color: '#FFF',
        },
    },
    sectionView: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        // alignItems: 'center',
    },
}));

const titleStyle = {
    fontFamily: 'furio', 
    fontSize: '24px', 
    fontWeight: 600, 
    textAlign: 'center'
}







function Dashboard() {
    const classes = useStyles();
    const { address: account } = useAccount();
    const { data } = useSWR(DATABASE_URL);

    const stablePools: IPoolCard[] = [];
    const mixedPools: IPoolCard[] = [];

    data?.instances?.map((instance) => {
        const tokenName = instance.poolName.split('_');
        let _pool: IPoolCard = {
            aTokenLogo: tokens[tokenName[0]].logo,
            bTokenLogo: tokens[tokenName[1]].logo,
            poolName: (instance.poolName).toUpperCase() ?? "",
            lp: instance.poolName ?? "",
            lpPrice: instance.lpPrice ?? 0,
            tvl: instance.tvl ?? 0,
            addresses: {
                furfiStrategy: instance.furfiStrategy.Address ?? "",
                standardStrategy: instance.standardStrategy.Address ?? "",
                stablecoinStrategy: instance.stablecoinStrategy.Address ?? "",
            },
            apy: {
                furfiStrategy: instance.furfiStrategy.Apy ?? 0,
                standardStrategy: instance.standardStrategy.Apy ?? 0,
                stablecoinStrategy: instance.stablecoinStrategy.Apy ?? 0,
            },
            lpRewardsApr: instance.lpRewardsAPR ?? 0,
            blockRewardsApr: {
                furfiStrategy: instance.furfiStrategy.FarmBaseAPR ?? 0,
                standardStrategy: instance.standardStrategy.FarmBaseAPR ?? 0,
                stablecoinStrategy: instance.stablecoinStrategy.FarmBaseAPR ?? 0,
            },
            additionalMintApr: instance.standardStrategy.additionalMintAPR ?? 0,
            additionalMintANdStakedApr: instance.furfiStrategy.additionalMintAndStakedAPR ?? 0,
            efficiencyLevel: data.efficiencyLevel ?? 0,
            furFiBnbPrice: data.furFiBnbPrice ?? 0,
        };
        if(instance.poolName == "dai_busd" || instance.poolName == "usdc_busd" || instance.poolName == "usdc_usdt" || instance.poolName == "usdt_busd")
            stablePools.push(_pool);
        else
            mixedPools.push(_pool);
    });


    const [param] = useSearchParams();
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const referrer = param.get('referrer');

    useEffect(() => {
        if (referrer) {
            dispatch(addReferrer({ referrer }));
            navigate('app', { replace: true });
        }
    }, [referrer]);

    const { investData } = useInvestInfo();
    const [totalInvest, setTotalInvest] = useState(0);
    const [avgAPY, setAvgAPY] = useState(0);

    useEffect(() => {
        if (investData) {
            let invest = 0;
            let apy = 0;
            let sumApy = 0;
            let avgApy = 0;
            investData.map((item) => {
                const lpPrice =
                    data?.instances.find((pool) => pool.poolName === item.pair).lpPrice ?? 0;
                const pairInfo = data?.instances?.find((pool) => pool.poolName === item.pair);
                if (item.strategy === 'furfiStrategy') apy = pairInfo.furfiStrategy.Apy ?? 0;
                else if (item.strategy === 'stablecoinStrategy') apy = pairInfo.stablecoinStrategy.Apy ?? 0;
                else if (item.strategy === 'standardStrategy') apy = pairInfo.standardStrategy.Apy ?? 0;
                invest += lpPrice * Number(item.deposit);
                sumApy += apy * lpPrice * Number(item.deposit);
            });
            avgApy = invest ? (sumApy / invest) : 0;
            setTotalInvest(invest);
            setAvgAPY(avgApy);
        }
    }, [investData]);




    const slideSettings = {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };
    const sliderRef = useRef<Slider>(null);
    const next = () => {
      sliderRef.current?.slickNext();
    };
    const previous = () => {
      sliderRef.current?.slickPrev();
    };

    return (
        <div className={classes.dashboardView}>
            <Box sx={{ display: 'flex', flexDirection: 'column', m: 'center', width: { xs: '90%', md: '80%' } }}>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        my: '50px',
                    }}
                >
                    <Box mb={2}>
                        <Typography sx={{ fontFamily: 'furio', fontSize: '32px', fontWeight: 900 }}>
                            Your Info
                        </Typography>
                        <Typography sx={{ fontSize: '24px' }}>Welcome Back</Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            width: { xs: '90%', md: 'fit-content' },
                            padding: '10px 30px',
                            borderRadius: '20px',
                            border: '1px solid #e57a3bA0',
                            // boxShadow: '0px 1px 4px #e57a3b',
                            '& .MuiTypography-root': {
                                color: '#FFF',
                                textAlign: 'center',
                            },
                            '& .MuiBox-root': {},
                        }}
                    >
                        <Box mx={1}>
                            <Typography sx={{fontSize:'18px', fontWeight:'600'}}>Total Investment</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                {!account ? (
                                    <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                    <Typography>{trim(totalInvest, 2)}$</Typography>
                                )}
                            </Box>
                        </Box>
                        <Box mx={1}>
                            <Typography sx={{fontSize:'18px', fontWeight:'600'}}>Estimate Monthly Income</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                {!account ? (
                                    <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                    <Typography>{trim(totalInvest * avgAPY/100/12, 2)}$</Typography>
                                )}
                            </Box>
                        </Box>
                        <Box mx={1}>
                            <Typography sx={{fontSize:'18px', fontWeight:'600'}}>Average APY</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                {!account ? (
                                    <Skeleton sx={{ bgcolor: 'grey.500' }} width="20px" height="25px" />
                                ) : (
                                    <Typography>{trim(avgAPY, 2)}%</Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.sectionView}>
                    <Box sx={{ width: { xs: '90%', md: '450px' }, my: '50px' }}>
                        <Typography sx={titleStyle}>Your Invested Pools</Typography>
                        {   investData && investData.length > 0 ? (
                            <Box sx={{width:'100%'}}>
                                <Slider ref={sliderRef} {...slideSettings}>
                                    {investData?.map((data) => (
                                        <ClaimCard detail={data}  key={data.pair && data.strategy}/>
                                    ))}
                                </Slider>
                                {   investData.length > 1 &&
                                    <Box 
                                        sx={{
                                            display:'flex', 
                                            justifyContent:"flex-end", 
                                            mr:'32px',
                                            gap:'8px',
                                            '& .MuiButton-root': {
                                                minWidth:"fit-content",
                                                borderRadius:'12px',
                                                color:'white',
                                                backgroundColor:'#0f3152'
                                            }
                                        }}
                                    >
                                        <Button onClick={previous}> 
                                            <ArrowBackIosNewRoundedIcon/> 
                                        </Button>
                                        <Button onClick={next}> 
                                            <ArrowForwardIosRoundedIcon/> 
                                        </Button>
                                    </Box>
                                }
                          </Box>
                            
                        ) : (
                            <NoClaimCard />
                        )}
                    </Box>
                    <Box sx={{ width: { xs: '90%', md: '450px' }, my: '50px' }}>
                        <Typography sx={titleStyle}>Single Furfi Staking</Typography>
                        <StakingCard />
                    </Box>
                </Box>
                <Typography sx={{...titleStyle, fontSize: '32px', mt:'50px'}}>Stable Pools</Typography>
                <Box className={classes.sectionView}>
                    {stablePools.map((pool, index) => (
                        <Box sx={{ width: { xs: '90%', md: '450px' }, my: '20px' }} key={index}>
                            <PoolCard poolInfo={pool} />
                        </Box>
                    ))}
                </Box>
                <Typography sx={{...titleStyle, fontSize: '32px', mt:'50px'}}>Mixed Pools</Typography>
                <Box className={classes.sectionView}>
                    {mixedPools.map((pool, index) => (
                        <Box sx={{ width: { xs: '90%', md: '450px' }, my: '20px' }} key={index}>
                            <PoolCard poolInfo={pool} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </div>
    );
}

export default Dashboard;

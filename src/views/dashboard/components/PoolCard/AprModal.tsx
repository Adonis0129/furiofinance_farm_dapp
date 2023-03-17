
import {
    Box,
    Divider,
    Modal,
    Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import { AprSection } from './AprSection'
import { IAprDetail } from './AprSection';

const useStyles = makeStyles((theme) => ({
    modalStyle: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '500px',
        overflow: 'auto',
        bgcolor: '#0a172a',
        boxShadow: '24px',
        borderRadius: '20px',
        background: 'linear-gradient(150deg,#102747 -87%,#102747)',
        paddingBottom:'8px',
    },
    hearderView: {
        display: "flex",
        justifyContent:"space-between",
        alignItems: "center",
        marginTop: '24px',
        marginBottom: '24px',
        paddingRight: '32px',
        paddingLeft: '32px',
        '& .MuiTypography-root':{
            color: 'white'
        }
    },

}));

interface IProps {
    open: boolean;
    onClose: () => void;
    aprDetails: IAprDetail[];
}

function AprModal(props: IProps) {

    const classes = useStyles();
    const { open, onClose, aprDetails} = props;

    return (
        <Modal 
            open={open} 
            onClose={onClose}
            sx={{'& > .MuiBackdrop-root': {backdropFilter: 'blur(10px)'} }}
        >
            <Box className={classes.modalStyle}>
                    <Box>
                        <Box className={classes.hearderView}>
                            <Typography sx={{ fontSize: '24px', color:'white' }}>APY Breakdown</Typography>
                            <Box>
                                <CloseIcon
                                    sx={{ width: '32px', height: '32px', color: '#FFF', cursor: 'pointer' }}
                                    onClick={onClose}
                                />
                            </Box>
                        </Box>
                        <Divider sx={{ borderBottomColor: '#666' }} />
                        { aprDetails.map((aprDetail) => (
                            <AprSection aprDetail={aprDetail} key={aprDetail.strategy}/>
                        ))}
                    </Box>
            </Box>
        </Modal>
    );
}

export default AprModal;

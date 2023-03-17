import React from "react";
import { Box, CircularProgress } from '@mui/material';

function Loader() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // backgroundColor: 'transparent'
            }}
        >
            <CircularProgress size={50} thickness={5} color="primary" />
        </Box>
    );
}

export default Loader;
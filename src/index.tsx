import React from 'react';
import ReactDOM from 'react-dom';

import { Theme } from '@mui/material/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SWRConfig } from 'swr';
import { Provider } from 'react-redux';
import axios from 'axios';
import { WagmiProvider, client } from './config/wagmi';
import store from './state';
import { RefreshContextProvider } from './context';

import App from './App';
import './index.css';

declare module '@mui/styles/defaultTheme' {
    interface DefaultTheme extends Theme {}
}

const theme = createTheme({
    typography: {
        // fontFamily: ["montserrat", "sans-serif"].join(","),
        fontFamily: 'inherit',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

const fetcher = (url) => axios.get(url).then((res) => res.data);

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <SWRConfig
                value={{
                    refreshInterval: 10000,
                    fetcher,
                }}
            >
                <WagmiProvider client={client}>
                    <Provider store={store}>
                        <RefreshContextProvider>
                            <App />
                        </RefreshContextProvider>
                    </Provider>
                </WagmiProvider>
            </SWRConfig>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

import { makeStyles } from '@mui/styles'
import { useMediaQuery } from '@mui/material'
import React, { useState } from 'react'
import Header from '../header'
import Sidebar from '../sidebar'
import clsx from 'clsx'
import Footer from '../footer'

interface IViewBaseProps {
    children: React.ReactNode
}

const useStyles = makeStyles(theme => ({
    content: {
        padding: '40px 0 80px',
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: 1000
        }),
        width: '100%'
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: 1000
        }),
        paddingLeft: 0
    }
}))

function ViewBase({ children }: IViewBaseProps) {
    const classes = useStyles()
    const [mobileOpen, setMobileOpen] = useState(false)
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }
    const isMd = useMediaQuery('(max-width: 960px)')

    return (
        <div>
            <Header handleDrawerToggle={handleDrawerToggle} />
            {
                isMd && <Sidebar drawerOpen={mobileOpen} drawerToggle={handleDrawerToggle} />
            }
            {/* main content */}
            <main
                // className={clsx([
                //     classes.content,
                //     {
                //         [classes.contentShift]: !isMd
                //     }
                // ])}
            >
                <div>{children}</div>
            </main>
            <Footer />
        </div>
    )
}

export default ViewBase

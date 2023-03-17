import React from 'react'
import { Typography, Button } from '@mui/material'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
export interface IProps {
  onClick?: () => void
  expanded?: boolean
}


function ExpandableSectionButton(props: IProps) {
    const { expanded, onClick } = props
  return (
    <Button 
        sx={{
            flexGrow: 1,
            bgcolor: '#0a172a9f',
            borderBottomRightRadius: '30px',
            py: 2,
            color: '#FFF',
        }}
        onClick={onClick}
    >
        {expanded ? <>Less<ExpandLessOutlinedIcon/></> : <>Details<ExpandMoreOutlinedIcon/></>}
    </Button>
  )
}

ExpandableSectionButton.defaultProps = {
  expanded: false,
}

export {ExpandableSectionButton};

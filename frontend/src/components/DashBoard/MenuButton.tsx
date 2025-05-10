import { MenuOpen } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";

interface Props{
    setToggle: React.Dispatch<React.SetStateAction<boolean>>,
    toggle?:boolean,
    size?:number
}

export default function MenuButton(props:Props) {
    return(
        <IconButton 
            sx={{
                width:props.size,
                height:props.size,
                borderRadius:0,
                '&:hover':{color:'white'},
                color:(props.toggle) ?  'action.active': 'inherit' }} 
            onClick={() => (props.setToggle((!props.toggle)))}>
            {(props.toggle) ? <MenuOpen sx={{ transform: 'scaleX(-1)', fontSize: '40px' }} />: <MenuOpen fontSize="large" sx={{  fontSize: '40px' }}/>}
        </IconButton>
    );
}
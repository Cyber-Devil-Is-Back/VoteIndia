import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import React from "react";

interface Props{
    signOut : () => void,
}

export default function AppBar(props:Props) {
    return(
        <Box width='100%' height='60px' bgcolor={'rgba(255, 255, 255, 0.32)'} display='flex' flexDirection='row' alignItems='center' justifyContent='space-between' px={5}>
            <Box display='flex' flexDirection='row' alignItems='center' gap={3} >
                <Box component='img' src='/images/election.png' width='50px'/>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        background: 'linear-gradient(to right, #FF9933, white, #138808)', // Saffron → White → Green
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                        display: 'inline-block', // ensures gradient applies correctly
                    }}
                    >
                    Vote India
                </Typography>
            </Box>
            <Button  onClick={props.signOut}
                sx={{ fontWeight:900, fontSize:22, textTransform:'none', marginRight:0,
                    '& .MuiButton-endIcon': {
                        '& > *': { fontSize: '40px', fontWeight : '900' }, },
                    '&:hover': {bgcolor:'primary.main',color:'white'}}}
                    endIcon={<ArrowRightAltIcon sx={{fontSize:'300px'}}/>}>
                Sign Out
            </Button>
           
        </Box>
    );

}
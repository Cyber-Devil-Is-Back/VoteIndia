import { Box, Container } from "@mui/material";


const AuthBase = ({children}: {children: React.ReactNode}) => {
    return (
        <Container  sx={{widht:'100vw',height:'100vh',bgcolor:'background.default',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Box width='fit-content' height='fit-content' bgcolor='white' className='form-base' display='flex' flexDirection='row' borderRadius={2} >
                <Box component='img' src={'/images/indian-voters.jpg'} alt=""  width={500} height='100%' sx={{borderRadius:'10px',display:{xs:'none',md:'block'}}}></Box>
                <Box sx={{display:'flex',flexDirection:'column',alignItems:'center', padding:3}}>
                    {children}  
                </Box>

            </Box>
        </Container>
    )

}
export default AuthBase;
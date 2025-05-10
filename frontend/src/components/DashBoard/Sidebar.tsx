import { Box } from "@mui/material";
import MenuButton from "./MenuButton";
import MenuList, { MenuItem } from "./MenuList";

interface Props{
    openSideBar:boolean,
    setOpenSideBar:React.Dispatch<React.SetStateAction<boolean>>,
    menuList:MenuItem[]
}


export default function SideBar(props:Props) {
    return (
        <Box 
            bgcolor={'rgba(255, 255, 255, 0.32)'}
            width= {props.openSideBar ? 350 : 60}
            minWidth={props.openSideBar ? 350 : 60}
            height={'100vh'} 
            overflow={'hidden'} 
            display='flex' 
            flexDirection='column' gap={1} pt={1}
            sx={{
                
                transition: 'width 0.3s ease-in-out',
            }}>
            <MenuButton toggle={props.openSideBar} setToggle={props.setOpenSideBar} size={55}/>
            <MenuList menus={props.menuList} defaultColor={'black'} color={'blue'} showText={props.openSideBar}></MenuList>
        </Box>
    );
}

"use client";
import {Box} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import React from "react";
import { MenuItem } from "../DashBoard/MenuList";
import BallotIcon from '@mui/icons-material/Ballot';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import AppBar from "../DashBoard/AppBar";
import SideBar from "../DashBoard/Sidebar";
import BaseLayout from "../DashBoard/BaseLayout";
import { PeopleAlt} from "@mui/icons-material";

const menuList: MenuItem[] = [
  { type: 'menuitem', name: "Dashboard", icon: <DashboardIcon />, link: "/admin/dashboard" },
  { type: 'divider' },
  { type: 'menuitem', name: "Voters", icon:  <Diversity1Icon />, link: "/admin/voters" },
  { type: 'menuitem', name: "New Party", icon:<PeopleAlt /> , link: "/admin/party/new" },
  {
    type: 'menuitem',
    name: "Candidates",
    icon: <PersonIcon />,
    link: "#", // can be "#" or omitted if not directly navigable
    children: [
      {
        name: "State",
        icon: <LocationCityIcon />,
        link: "/admin/candidates/new/state"
      },
      {
        name: "National",
        icon: <PublicIcon />,
        link: "/admin/candidates/new/national"
      }
    ]
  },
  { type: 'divider' },
  { type: 'menuitem', name: "Election", icon: <BallotIcon />, link: "/admin/election" },
  { type: 'menuitem', name: "Dashboard", icon: <ShoppingCartIcon />, link: "/orders" }
];

export default function AdminDashBoardLayout({ children }: { children: React.ReactNode }) {
  
  const [openSideBar,setOpenSideBar] = React.useState(true);

  return (
        <BaseLayout>
         <SideBar openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} menuList={menuList}/>
         <Box maxWidth={`calc(100% - ${openSideBar ? '350px' : '60px'})`} width='100%' height='100vh' display='flex' flexDirection='column' gap={4}>
                     
                     <AppBar signOut={() => (console.log("f"))}/>
                     <Box width='100%' height='100%' px={5} >
                       <Box px={3} pb={3} 
                         sx={{maxWidth: `100%`,height: '100%',bgcolor: 'rgba(255,255,255,0.36)',borderRadius: '10px'}}>
                         {children}
                       </Box>
                     </Box>
                   </Box>  
        </BaseLayout>
  );
}

"use client";
import {Box} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";

import React from "react";
import { MenuItem } from "../DashBoard/MenuList";

import AppBar from "../DashBoard/AppBar";
import SideBar from "../DashBoard/Sidebar";
import BaseLayout from "../DashBoard/BaseLayout";
import { PeopleAlt} from "@mui/icons-material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';


const menuList : MenuItem[] = [
  { type: 'menuitem', name: "Dashboard", icon: <DashboardIcon />, link: "/party/dashboard" },
  { type: 'divider' },
  { type: 'menuitem', name: "Candidate List", icon: <PeopleAlt />, link: "/party/candidate-list" },
  { type: 'menuitem', name: "Nomination", icon: <PersonAddIcon />, link: "/party/nomination" },
  { type: 'divider' },

];
export default function DashBoardLayout({ children }: { children: React.ReactNode }) {
  
  const [openSideBar,setOpenSideBar] = React.useState(true);

  return (
        <BaseLayout>
          <SideBar openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} menuList={menuList}/>
          <Box maxWidth={`calc(100% - ${openSideBar ? '350px' : '60px'})`} width='100%' height='100vh' display='flex' flexDirection='column' gap={4}>
            
            <AppBar signOut={() => (console.log("f"))}/>
            <Box width='100%' height='calc(100% - 80px)' px={5} >
              <Box px={3} pb={3} 
                sx={{maxWidth: `100%`,height: '100%',bgcolor: 'rgba(255,255,255,0.36)',borderRadius: '10px'}}>
                {children}
              </Box>
            </Box>
          </Box>  
        </BaseLayout>
  );
}


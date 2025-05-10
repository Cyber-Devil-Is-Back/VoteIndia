'use client';

import { ChangeEvent, useEffect, useState } from "react";
import DashBoardLayout from "@/components/parties/DashBoardLayout";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,Typography } from "@mui/material";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { GridRowsProp, GridColDef} from '@mui/x-data-grid';
import DataGridComp from "@/components/DataGrid";
import CustomTextField from "@/components/CustomTextField";
import PartySymbolPicker from "@/components/parties/register/PartySymbolPicker";
import StateCandidatesLayout from "@/components/parties/Candidates/State/Layout";
import NationalCandidatesLayout from "@/components/parties/Candidates/National/Layout";

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 450 },
  { field: 'gender', headerName: 'Gender', width: 150 },
  { field: 'image', headerName: 'Image', width: 100 },
  { field: 'dob', headerName: 'Date Of Birth', width: 200 },
  { field: 'state', headerName: 'State', width: 250 },
  { field: 'district', headerName: 'District', width: 200 },
  { field: 'constituency', headerName: 'Constituency', width: 300 },
];
interface FormState {
  name: string;
  gender: string;
  image: File | null;
  dob: string;
  state: string;
  district: string;
  constituency: string;
};

type ConstituencyMap = {
  [district: string]: string[];
};

export default function CandidateList() {
 
  return (
    <DashBoardLayout>
      {sessionStorage.getItem('partyType') === 'National' ? <NationalCandidatesLayout/> : <StateCandidatesLayout/>}
    </DashBoardLayout>
  );
}



// <Box sx={{display: 'flex',flexDirection: 'column',height: '100%', width: '100%'}} overflow={'auto'}>
        
// <Box  width='100%'  py={2}  px={3} display='flex' justifyContent='space-between' alignItems='center' >
//   <Typography variant="h5" fontWeight={600} color='primary' > Candidate List </Typography>
//   <Button variant="contained">Add new</Button>
// </Box>
// <Box maxWidth='100%' width={'100%'} height='100%'>
//   <DataGridComp rows={rows} columns={columns} loading={loading}/>
// </Box>   
// <Dialog open={open} onClose={() => setOpen(false)} fullWidth  aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
//   <DialogTitle id="alert-dialog-title" alignItems='center'> {'Add New Candiate'} </DialogTitle>
//   <DialogContent>
//     <PartySymbolPicker size={200} onFileSelect={setIcon} icon={form.image} defaultIcon={<AccountBoxIcon fontSize="large" sx={{color:'black'}}/>} />
//     <CustomTextField autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard" sx={{mb: 2}}/>
//     <CustomTextField id="gender" label='Gender' select fullWidth variant="standard" sx={{mb: 2}} >
//       <MenuItem key='male' value="Male">Male</MenuItem>
//       <MenuItem key='femail' value='Female'>Female</MenuItem>
//     </CustomTextField>
//     <CustomTextField id='dob' label='Date of Birth' type='date' fullWidth variant="standard" sx={{mb: 2}} slotProps={{ inputLabel: { shrink: true } }} />
//     <CustomTextField id='state' label='State' select fullWidth value={form.state ? form.state : state?.[0]} variant="standard" onChange={(e:ChangeEvent<HTMLInputElement>) => (setdata(e.target.value,'state'))} sx={{mb: 2}} >
//       {state?.sort()?.map((item: string,index:number) => (
//         <MenuItem key={index} value={item}>{item}</MenuItem>
//       ))}
//     </CustomTextField>
//     <CustomTextField id='district' label='District' value={form.district} select fullWidth variant="standard" onChange={(e:ChangeEvent<HTMLInputElement>) => (setdata(e.target.value,'district'))} sx={{mb: 2}} >
//       {Object.keys(constituencyData).map((item: string,index:number) => (
//         <MenuItem key={index} value={item}>{item}</MenuItem>
//       ))} 
//     </CustomTextField>
//     <CustomTextField id='constituency' label='Constituency' value={form.constituency} select fullWidth variant="standard" onChange={(e:ChangeEvent<HTMLInputElement>) => (setdata(e.target.value,'constituency'))} sx={{mb: 2}} >
//       {
//         constituencyData[form.district]?.map((item: string,index:number) => (
//           <MenuItem key={index} value={item}>{item}</MenuItem>
//         ))
//       }
//     </CustomTextField>
//   </DialogContent>
//   <DialogActions>
//     <Button onClick={() => setOpen(false)} color="primary" variant="contained">Add</Button>
//     <Button onClick={() => setOpen(false)} color="error" variant="contained">Cancel</Button>
//   </DialogActions>
// </Dialog>  

// </Box>
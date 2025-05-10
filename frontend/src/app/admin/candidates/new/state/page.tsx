"use client"
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Box, Button, Typography } from "@mui/material";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 450 },
  { field: 'gender', headerName: 'Gender', width: 150 },
  { field: 'image', headerName: 'Image', width: 100 },
  { field: 'dob', headerName: 'Date Of Birth', width: 200 },
  { field: 'state', headerName: 'State', width: 250 },
  { field: 'district', headerName: 'District', width: 200 },
  { field: 'constituency', headerName: 'Constituency', width: 300 },
];


export default function NewState()  {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading,setLoading] = useState(false);
    // const fetchData = async () => {
    //     setLoading(true);
    // //     try {
    // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidate/getAllNewCandidates`);
    // //       const data = await response.json();
    // //       if (response.ok) {
    // //         // Convert _id to id for DataGrid
    // //         const updatedRows = data.map((item: any) => ({
    // //           ...item,
    // //           id: item._id, // or item._id.$oid if it's a nested BSON ObjectId
    // //         }));
    // //         // setRows(updatedRows);
    // //       } else {
    // //         console.error('Error fetching data:', data);
    // //       }
    // //     } catch (error) {
    // //       console.error('Error fetching data:', error);
    // //     } finally {
    // //       setLoading(false);
    // //     }
    // //   };
    //   fetchData();
    return(
        <AdminDashBoardLayout>
            <Box sx={{display: 'flex',flexDirection: 'column',height: '100%', width: '100%'}} overflow={'auto'}>
       
                <Box  width='100%'  py={2}  px={3} display='flex' justifyContent='space-between' alignItems='center' >
                    <Typography variant="h5" fontWeight={600} color='primary' > Candidate List </Typography>
                    <Button variant="contained">Add new</Button>
                </Box>
                    <Box maxWidth='100%' width={'100%'} height='100%'>
                    <DataGridComp rows={rows} columns={columns} loading={loading}/>
            </Box>  
        </Box>
        </AdminDashBoardLayout>
    )
}

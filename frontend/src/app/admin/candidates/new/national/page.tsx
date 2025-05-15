"use client"
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Avatar, Box, Chip, Typography } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Dialoge, { Candidate } from "@/components/candidate/Dialoge";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
 
  { field: 'name', headerName: 'Name', width: 300 },
  { field: 'gender', headerName: 'Gender', width: 150 },
    { field: 'party_id', headerName: 'Party ID', width: 100 },
  { field: 'image', headerName: 'Image', width: 100,renderCell: (params) => (
    <Box display="flex" justifyContent="center" alignItems="center">
        <Avatar src={`${process.env.NEXT_PUBLIC_API_URL}/${params.value}`} alt="Candidate Image" variant="rounded" style={{ width: '50px', height: '50px' }} />
    </Box>
    ) },
  { field: 'dob', headerName: 'Date Of Birth', width: 200 },
  { field: 'state', headerName: 'State', width: 260 },
  { field: 'constituency', headerName: 'Constituency', width: 250 },
    { field: 'status', headerName: 'Status', width: 200, type: 'singleSelect',renderCell: (params) => (
        <Chip icon={<HourglassTopIcon fontSize="small" />} label="Pending"  color="info"  size="small"  variant="outlined"  sx={{ fontWeight: 'bold' }} /> 
    ) },
];


export default function NewNational()  {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading,setLoading] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<Candidate | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const loadCandidates = async () => {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/national/candidate/get_all_new`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            setRows(data);
            console.log(data);
            setLoading(false);
        } else {
            const error = await response.json();
            console.log(error);
            setLoading(false);
        }
    }
    useEffect(() => {
    if (dialogOpen === false) {
        loadCandidates();
    }
    }, [dialogOpen]);
    useEffect(() => {
        loadCandidates();
    }, [])

    const handleRowClick = (params: any) => {
        setSelectedCandidates(params.row);
        setDialogOpen(true);
    };
    return(
        <AdminDashBoardLayout>
            <Box sx={{display: 'flex',flexDirection: 'column',height: '100%', width: '100%'}} overflow={'auto'}>
                <Box  width='100%'  py={2}  px={3} display='flex' justifyContent='center' alignItems='center' >
                    <Typography variant="h5" fontWeight={600} color='primary' > Candidate List </Typography>
                   
                </Box>
                    <Box maxWidth='100%' width={'100%'} height='100%'>
                    <DataGridComp rows={rows} columns={columns} loading={loading} dataGridProps={{
              onRowClick:handleRowClick
            }}/>
                </Box>  
                <Dialoge data={selectedCandidates} setOpenDialog={setDialogOpen} open={dialogOpen}/>
            </Box>
        </AdminDashBoardLayout>
    )
}

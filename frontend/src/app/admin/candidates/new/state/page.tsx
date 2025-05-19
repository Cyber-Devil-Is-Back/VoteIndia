"use client"
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Avatar, Box, Button, Chip, Typography } from "@mui/material";
import { GridColDef, GridRowParams, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import Dialoge from "@/components/candidate/Dialoge";

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 350 },
  { field: 'party_id', headerName: 'Party ID', width: 100 },
  { field: 'gender', headerName: 'Gender', width: 150 },
  { field: 'image', headerName: 'Image', width: 140,renderCell: (params) => (
            <Box display="flex" justifyContent="center" alignItems="center">
                <Avatar src={`${process.env.NEXT_PUBLIC_API_URL}/${params.value}`} alt="Candidate Image" variant="rounded" style={{ width: '50px', height: '50px' }} />
            </Box>) },
  { field: 'dob', headerName: 'Date Of Birth', width: 200 },
  { field: 'state', headerName: 'State', width: 200 },
  { field: 'district', headerName: 'District', width: 250 },
  { field: 'constituency', headerName: 'Constituency', width: 300 },
  { field: 'status', headerName: 'Status', width: 200, type: 'singleSelect',renderCell: (params) => (
        <Chip icon={<HourglassTopIcon fontSize="small" />} label="Pending"  color="info"  size="small"  variant="outlined"  sx={{ fontWeight: 'bold' }} /> 
    ) },
];


export default function NewState()  {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading,setLoading] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<Record<string,string|number>>({});
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleRowClick = (params: GridRowParams) => {
            setSelectedCandidates({
                "Candidate ID": params.row.id,
                "Candidate Name": params.row.name,
                "Candidate Gender": params.row.gender,
                "Candidate Image": params.row.image,
                "Candidate Date Of Birth": params.row.dob,
                "Candidate Election State": params.row.state,
                "Candidate Election District": params.row.district,
                "Candidate Election Constituency": params.row.constituency,
                "party_id": params.row.party_id, 
            });
            setDialogOpen(true); };
    
    const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/candidate/get_all_new`);
          const data = await response.json();
          if (response.ok) {
            // Convert _id to id for DataGrid
           
            setRows(data);
          } else {
            console.error('Error fetching data:', data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
    useEffect(() => {
       fetchData();
    }, []); 
     useEffect(() => {
    if (dialogOpen === false) {
        fetchData();
    }
    }, [dialogOpen]);  
     
    return(
        <AdminDashBoardLayout>
            <Box sx={{display: 'flex',flexDirection: 'column',height: '100%', width: '100%'}} overflow={'auto'}>
       
                <Box  width='100%'  py={2}  px={3} display='flex' justifyContent='space-between' alignItems='center' >
                    <Typography variant="h5" fontWeight={600} color='primary' > Candidate List </Typography>
                    <Button variant="contained">Add new</Button>
                </Box>
                    <Box maxWidth='100%' width={'100%'} height='100%'>
                    <DataGridComp rows={rows} columns={columns} loading={loading} dataGridProps={{
              onRowClick:handleRowClick}} />
            </Box>  
             <Dialoge data={selectedCandidates} setOpenDialog={setDialogOpen} open={dialogOpen} updateLink="/party/state/candidate/update_status/"/>
        </Box>
        </AdminDashBoardLayout>
    )
}

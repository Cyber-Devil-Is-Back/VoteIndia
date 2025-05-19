"use client"
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Avatar, Box, Chip, Tooltip, Typography } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GridColDef, GridRowParams, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Dialoge from "@/components/candidate/Dialoge";

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
    { field: 'status', headerName: 'Status', width: 200, type: 'singleSelect',
  renderCell: (params) => {
    const status = params.value;
    
    if (status === 'Rejected') {
      return (
        <Tooltip title={params.row.reason} arrow>
          <Chip
            icon={<CancelIcon fontSize="small" />}
            label="Rejected"
            color="error"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        </Tooltip>
      );
    } else if (status === 'Approved') {
      return (
        <Chip
          icon={<CheckCircleIcon fontSize="small" />}
          label="Approved"
          color="success"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      );
    } else {
      return (
        <Chip
          icon={<HourglassTopIcon fontSize="small" />}
          label="Pending"
          color="info"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      );
    }
  }
}
];


export default function NewNational()  {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading,setLoading] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<Record<string,string|number>>({});
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

    const handleRowClick = (params: GridRowParams) => {
        setSelectedCandidates({
            "Candidate ID": params.row.id,
            "Candidate Name": params.row.name,
            "Candidate Gender": params.row.gender,
            "Candidate Image": params.row.image,
            "Candidate Date Of Birth": params.row.dob,
            "Candidate Election State": params.row.state,
            "Candidate Election Constituency": params.row.constituency,
            "party_id": params.row.party_id, 
        });
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
                <Dialoge data={selectedCandidates} setOpenDialog={setDialogOpen} open={dialogOpen} updateLink="/party/national/candidate/update_status/"/>
            </Box>
        </AdminDashBoardLayout>
    )
}

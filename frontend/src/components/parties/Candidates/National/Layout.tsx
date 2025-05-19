import DataGridComp from "@/components/DataGrid";
import {  HourglassTop as HourglassTopIcon, CheckCircle, Cancel } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import { getGridSingleSelectOperators, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import AddDialog from "./AddDialog";

const statusOptions = ['Active', 'Inactive', 'Pending'];

const Pending = () => (
    <Chip icon={<HourglassTopIcon fontSize="small" />} label="Pending"  color="info"  size="small"  variant="outlined"  sx={{ fontWeight: 'bold' }} />
)
const Approved = () => (
    <Chip icon={<CheckCircle fontSize="small" />} label="Approved" color="success" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
  );
  
  const Rejected = () => ( 
    <Chip icon={<Cancel fontSize="small" />} label="Rejected" color="error" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
  );
  


export default function NationalCandidatesLayout() {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState({
        id: 0,
        party_id: 0,
        name: '',
        gender:'',
        image: '',
        dob: '',
        state: '',
        constituency: '',
        status: '',
        reason: '',

    });

    const handleClose = () => {
        setOpen(false);
        loadCandidates();
    }
    const columns :GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'party_id', headerName: 'Party ID', width: 100 },
        { field: 'name', headerName: 'Name', width: 400 },
        { field: 'gender', headerName : 'Gender', width: 100 },
        { field: 'image', headerName: 'Image', width: 100 ,renderCell: (params) => (
            <Box display="flex" justifyContent="center" alignItems="center">
                <Avatar src={`${process.env.NEXT_PUBLIC_API_URL}/${params.value}`} alt="Candidate Image" variant="rounded" style={{ width: '50px', height: '50px' }} />
            </Box>
     )},
        { field: 'dob', headerName: 'Date Of Birth', width: 150 },
        { field: 'state', headerName: 'State', width: 260 },
        { field: 'constituency', headerName: 'Constituency', width: 250 },
         { field: 'status', headerName: 'Status', width: 200, type: 'singleSelect',renderCell: (params) => {
            const status = params.value;
            if (status === 'Rejected') {
              return (
                <Tooltip title={params.row.reason} arrow>
                    <Chip   icon={<Cancel fontSize="small" />}   label="Rejected"   color="error"   size="small"   variant="outlined"   sx={{ fontWeight: 'bold' }} />
                </Tooltip>
              );
            } else if (status === 'Approved') {
              return (
                <Chip icon={<CheckCircle fontSize="small" />} label="Approved" color="success" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
              );
            } else {
              return (
                <Chip icon={<HourglassTopIcon fontSize="small" />} label="Pending" color="info" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
              );
            }
          }
        }
    ]
    const loadCandidates = async () => {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/national/candidate/get_all`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            setRows(data);
            setLoading(false);
        } else {
            const error = await response.json();
            console.log(error);
            setLoading(false);
        }
    }
    useEffect(() => {
        loadCandidates();
    }, []);

    const handleRowClick = (params: any) => {
        console.log(params.row);
    };

    return (
        <Box width="100%" height="100%" py={3} display='flex' flexDirection='column' gap={2} >
        <Box display="flex" flexDirection="row" alignItems="center" position="relative" width="100%">
                <Box position="absolute" left="50%" sx={{ transform: 'translateX(-50%)' }}>
                    <Typography variant="h5" fontWeight={600} color="primary" textAlign="center"> All National Candidates </Typography>
                </Box>
                <Box ml="auto">
                    <Button variant="contained" color="primary" onClick={() => (setOpen(true))}> Add New Candidate </Button>
                </Box>
            </Box>
            <DataGridComp rows={rows} columns={columns} loading={loading}/>
            <AddDialog open={open} onClose={handleClose} />
        </Box>
        
    );
}
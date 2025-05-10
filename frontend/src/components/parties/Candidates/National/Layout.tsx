import DataGridComp from "@/components/DataGrid";
import { Box, Button, Typography } from "@mui/material";
import { getGridSingleSelectOperators, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const statusOptions = ['Active', 'Inactive', 'Pending'];



export default function NationalCandidatesLayout() {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(false);
    const [constituency, setConstituency] = useState<String[]>([]);
    const loadconstuituency = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/national/constituency`, {
            method: 'GET',
        });
        const data = await response.json();
        if (response.ok) {
            setConstituency(data.constituency);
        } else {
            console.error('Error fetching constituency:', data.message);
        }
    }
    useEffect(() => {
        loadconstuituency();
    },[]);
    const columns :GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'party_id', headerName: 'Party ID', width: 110 },
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'gender', headerName : 'Gender', width: 120 },
        { field: 'image', headerName: 'Image', width: 100 },
        { field: 'dob', headerName: 'Date Of Birth', width: 200 },
        { field: 'state', headerName: 'State', width: 250 },
        { field: 'constituency', headerName: 'Constituency', width: 300,type: 'singleSelect' ,valueOptions: constituency,filterOperators: getGridSingleSelectOperators()},
        {field : 'status', headerName: 'Status', width: 150,type: 'singleSelect' ,valueOptions: statusOptions,filterOperators: getGridSingleSelectOperators()},
    ]
    
    return (
        <Box width="100%" height="100%" py={3} display='flex' flexDirection='column' gap={2} >
        <Box display="flex" flexDirection="row" alignItems="center" position="relative" width="100%">
                <Box position="absolute" left="50%" sx={{ transform: 'translateX(-50%)' }}>
                    <Typography variant="h5" fontWeight={600} color="primary" textAlign="center">
                    All National Candidates
                    </Typography>
                </Box>
                <Box ml="auto">
                    <Button variant="contained" color="primary">
                    Add New Candidate
                    </Button>
                </Box>
            </Box>
            <DataGridComp rows={rows} columns={columns} loading={loading}/>
        </Box>
    );
}
"use client";
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Box, Chip, Typography } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import PartyDialog from "./Dialog";

// Define the PartyReturn interface
interface PartyReturn {
  _id: number;
  name: string;
  party_abbreviation: string;
  party_slogan: string;
  registration_on: string;
  party_description: string;
  party_type: string;
  party_email: string;
  party_website: string;
  phone_number: string;
  party_leader: string;
  party_founder: string;
  party_manifesto: string;
  party_logo: string;
  state: string;
  leader_image: string;
  status: string;
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Party Name', width: 250 },
  { field: 'registration_on', headerName: 'Registered ON', width: 150 },
  { field: 'party_type', headerName: 'Party Type', width: 200 },
  { field: 'party_email', headerName: 'Party Email', width: 250 },
  { field: 'party_leader', headerName: 'Party Leader', width: 220 },
  { field: 'phone_number', headerName: 'Phone Number', width: 200 },
  {
    field: 'party_logo',
    headerName: 'Party Logo',
    width: 150,
    renderCell: (params) => (
      <Box display='flex' justifyContent='center'>
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}/${params.value}`}
          alt="Party Logo"
          style={{ width: '50px', height: '50px' }}
        />
      </Box>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: () => (
      <Chip
        icon={<HourglassTopIcon fontSize="small" />}
        label="Pending"
        color="info"
        size="small"
        variant="outlined"
        sx={{ fontWeight: 'bold' }}
      />
    ),
  },
];

export default function NewParty() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyReturn | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/getAllNewPartys`);
      const data = await response.json();
      if (response.ok) {
        // Convert _id to id for DataGrid
        const updatedRows =  data.map((item: PartyReturn) => ({
          ...item,
          id: item._id, // or item._id.$oid if it's a nested BSON ObjectId
        }));
        setRows(updatedRows);
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
    fetchData();
  }, [dialogOpen]);

  const handleRowClick = (params: any) => {
    setSelectedParty(params.row as PartyReturn);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedParty(null);
  };

  return (
    <AdminDashBoardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }} overflow={'auto'}>
        <Box width='100%' py={2} px={3} display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant="h5" fontWeight={600} color='primary'>
            Candidate List
          </Typography>
        </Box>
        <Box maxWidth='100%' width={'100%'} height='100%'>
          <DataGridComp
            rows={rows}
            columns={columns}
            loading={loading}
            dataGridProps={{
              onRowClick:handleRowClick
            }}
           
          />
        </Box>
      </Box>
      <PartyDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        party={selectedParty}
      />
    </AdminDashBoardLayout>
  );
}


// 

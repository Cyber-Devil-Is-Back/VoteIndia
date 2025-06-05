'use client';
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Box, Button, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

interface Voter {
    id: number;
    username: string;
    email: string;
    image: string;
    walletaddress: string;
    state:string
}
export default function Voters(){
    const [voters,setVoters] = useState<Voter[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 150 },
        { field: 'username', headerName: 'Name', width: 250 },
        { field: 'email', headerName: 'Email', width: 300 },
        {
            field: 'image',
            headerName: 'Image',
            width: 100,
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" alignItems="center">
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${params.value}`}
                        alt="Voter"
                        style={{ width: 80, height: 80, borderRadius: '50%' }}
                    />
                </Box>
            ),
        },
        { field: 'state', headerName: 'State', width: 150 },
        { field: 'walletaddress', headerName: 'Address', width: 400 },

    ];
    const fetchVoters = async () => {
        setFetching(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/voters`);
            if (!response.ok) {
                throw new Error('Failed to fetch voters');
            }
            const data = await response.json();
            console.log(data)
            setVoters(data.voters);
        } catch (error) {
            console.error("Error fetching voters:", error);
        } finally {
            setFetching(false);
        }
    };
    useEffect(() => {
        fetchVoters();
    }, []);

    const fundTokens = async () => {
        const walletaddress = voters.map(voter => voter.walletaddress);
        console.log(walletaddress)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/fund-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addresses: walletaddress,
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fund tokens');
            }
            const data = await response.json();
            console.log(data);
            fetchVoters();
        } catch (error) {
            console.error("Error funding tokens:", error);
        }
    };

    return(
        <AdminDashBoardLayout>
           <Box display="flex" flexDirection="column" p={5} >
                <Box position="relative" width="100%" mb={5}>
                    <Typography variant="h4" color="primary" fontWeight={900} textAlign="center" > Voters List </Typography>
                    <Box position="absolute" right={0} top={0}>
                    <Button variant="contained" color="primary" onClick={fundTokens}>
                        <Typography variant="body1" fontWeight={800}>Fund Tokens</Typography>
                    </Button>
                    </Box>
                </Box>
                <DataGridComp
                          columns={columns}
                          rows={voters}
                          loading={fetching}
                          dataGridProps={{ getRowHeight: () => 90 }}/>
            </Box>
        </AdminDashBoardLayout>
    )
}


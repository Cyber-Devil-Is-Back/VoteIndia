'use client';
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import DataGridComp from "@/components/DataGrid";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";

export interface Nomination {
  election_type: string;
  constituency: string;
  candidateid: number;
  location: string; // district or state
  candidate_name: string;
  candidate_image: string;
}

export default function NominationsPage() {
  const [candidates, setCandidates] = useState<Nomination[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  const handleApprove = async (row: Nomination) => {
    setLoadingIds((prev) => [...prev, row.candidateid]);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/finalize-nomination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Nomination finalized successfully:", data);
        setCandidates((prev) =>
          prev.filter((c) => c.candidateid !== row.candidateid)
        );
      } else {
        console.error("Server error:", data);
      }
    } catch (error) {
      console.error("Error finalizing nomination:", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== row.candidateid));
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'candidate_image',
      headerName: 'Image',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Avatar
            src={`${process.env.NEXT_PUBLIC_API_URL}/${params.value}`}
            alt="Candidate"
            variant="rounded"
            sx={{ width: 80, height: 80 }}
          />
        </Box>
      ),
    },
    { field: 'candidate_name', headerName: 'Candidate Name', width: 300 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'constituency', headerName: 'Constituency', width: 200 },
    { field: 'election_type', headerName: 'Election Type', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const isLoading = loadingIds.includes(params.row.candidateid);
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApprove(params.row)}
            disabled={isLoading}
          >
            {isLoading ? 'Approving...' : 'Approve'}
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/get-nominations`);
        if (!response.ok) throw new Error('Failed to fetch nominations');
        const data: Nomination[] = await response.json();
        const rowsWithId = data.map((item) => ({
          ...item,
          id: item.candidateid,
        }));
        setCandidates(rowsWithId);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchCandidates();
  }, []);

  return (
    <AdminDashBoardLayout>
      <Box display="flex" flexDirection="column" alignItems="center" pt={4} height="100%">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={2} textAlign="center">
          Nomination Candidates List
        </Typography>
        <DataGridComp
          columns={columns}
          rows={candidates}
          loading={fetching}
          dataGridProps={{ getRowHeight: () => 90 }}
        />
      </Box>
    </AdminDashBoardLayout>
  );
}

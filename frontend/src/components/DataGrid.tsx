import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp, DataGridProps } from "@mui/x-data-grid";
import React from 'react';

interface Props {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading: boolean;
  dataGridProps?: Partial<DataGridProps>;
}

const paginationModel = { page: 0, pageSize: 14 };

export default function DataGridComp({ columns, rows, loading, dataGridProps }: Props) {
  return (
    <Box width='100%' height='100%' display='flex' flexDirection='column' px={0} gap={2} overflow={'auto'}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[7,14]}
        initialState={{
          pagination: { paginationModel }
        }}
        sx={{
          width: '100%',
          bgcolor: 'rgba(255,255,255,0.36)',
          border: 'none',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'action.active',
            color: 'white',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 800
          },
          '& .MuiDataGrid-columnHeaderFilterInput:hover': {
            color: "white"
          },
          '& .MuiDataGrid-sortIcon': {
            color: 'white',
            fontWeight: 900
          },
          '& .MuiDataGrid-menuIconButton': {
            color: 'white'
          },
          '& .MuiDataGrid-columnHeaders .MuiSvgIcon-root': {
            color: 'white'
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row':{
            borderBottom: '3px solid #cccc',
          }
        }}
        {...dataGridProps}
      />
    </Box>
  );
}
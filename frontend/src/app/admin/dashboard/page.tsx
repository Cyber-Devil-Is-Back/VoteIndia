'use client'
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import { GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";


export default function DashBoard()  {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading,setLoading] = useState(false);
    return(
        <AdminDashBoardLayout>
            {''}
        </AdminDashBoardLayout>
    )
}
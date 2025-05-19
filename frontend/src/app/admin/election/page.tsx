'use client'
import AdminDashBoardLayout from "@/components/admin/AdminDashBoardLayout";
import NewElectionPage from "@/components/Election/NewElection";

export default function ElectionPage() {
    return (
       <AdminDashBoardLayout>
         <NewElectionPage/>
       </AdminDashBoardLayout>
    );
}
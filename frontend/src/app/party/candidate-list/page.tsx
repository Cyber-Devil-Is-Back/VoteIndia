'use client';
import DashBoardLayout from "@/components/parties/DashBoardLayout";

import { GridColDef} from '@mui/x-data-grid';

import StateCandidatesLayout from "@/components/parties/Candidates/State/Layout";
import NationalCandidatesLayout from "@/components/parties/Candidates/National/Layout";

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 450 },
  { field: 'gender', headerName: 'Gender', width: 150 },
  { field: 'image', headerName: 'Image', width: 100 },
  { field: 'dob', headerName: 'Date Of Birth', width: 200 },
  { field: 'state', headerName: 'State', width: 250 },
  { field: 'district', headerName: 'District', width: 200 },
  { field: 'constituency', headerName: 'Constituency', width: 300 },
];
interface FormState {
  name: string;
  gender: string;
  image: File | null;
  dob: string;
  state: string;
  district: string;
  constituency: string;
};

type ConstituencyMap = {
  [district: string]: string[];
};

export default function CandidateList() {
 
  return (
    <DashBoardLayout>
      {/* {sessionStorage.getItem('partyType') === 'National' ? <NationalCandidatesLayout/> : <StateCandidatesLayout/>} */}
      <NationalCandidatesLayout/>
    </DashBoardLayout>
  );
}


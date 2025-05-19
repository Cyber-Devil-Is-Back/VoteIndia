'use client';
import DashBoardLayout from "@/components/parties/DashBoardLayout";

import { GridColDef} from '@mui/x-data-grid';

import StateCandidatesLayout from "@/components/parties/Candidates/State/Layout";
import NationalCandidatesLayout from "@/components/parties/Candidates/National/Layout";
import { useEffect, useState } from "react";


export default function CandidateList() {

  const [partType,setParty] = useState("National")
  useEffect(() => {
    setParty(sessionStorage.getItem('partyType') || 'National');
  },[]);
 
  return (
    <DashBoardLayout>
      {partType === 'National' ? <NationalCandidatesLayout/> : <StateCandidatesLayout/>}
      {/* <StateCandidatesLayout/> */}
    </DashBoardLayout>
  );
}


import React from 'react';
import { PartyDetails, PartyContactAndLeaderDetails } from "./structs";
import { Box, Typography, Divider, Avatar, Button } from "@mui/material";

interface ReviewProps {
  partydetails: PartyDetails;
  partyContactAndLeaderDetails: PartyContactAndLeaderDetails;
  loading?: boolean;
  onFinish: () => void;
  onBack: () => void;
}

const ReviewComponent: React.FC<ReviewProps> = ({ partydetails, partyContactAndLeaderDetails,onBack,onFinish,loading }) => {

  return (
    <Box display="flex" flexDirection="column" >
        <Box p={4} display="flex" flexDirection="column" sx={{ height: '600px',  overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9'}}>
        <Typography variant="h5" fontWeight='700' gutterBottom>Review Party Registration Details</Typography>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight='600' textAlign='center'>Party Details</Typography>
        <Box display={"flex"} flexDirection="row" justifyContent={'space-between'} p={2}>
          <Box height={'100%'}  p={4}>
            <Typography><strong>Party Name:</strong> {partydetails.partyname}</Typography>
            <Typography><strong>Abbreviation:</strong> {partydetails.partyabbr}</Typography>
            <Typography><strong>Slogan:</strong> {partydetails.slogan}</Typography>
            <Typography><strong>Date of Formation:</strong> {partydetails.date}</Typography>
            <Typography><strong>Party Type:</strong> {partydetails.partytype}</Typography>
            {partydetails.state && <Typography><strong>State:</strong> {partydetails.state}</Typography>}
            <Typography><strong>Description:</strong> {partydetails.desc}</Typography>
          </Box>
            
            {partydetails.logo && (
            <Box  height={'100%'} >
                <Typography><strong>Party Logo:</strong></Typography>
                <Avatar
                src={URL.createObjectURL(partydetails.logo)}
                alt="Party Logo"
                sx={{ width: 150, height: 150 ,mt: 2}}
                variant="rounded"
                />
            </Box>
            )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight='600' textAlign='center'>Contact & Leadership</Typography>
        <Box  display={"flex"} flexDirection="row" justifyContent={'space-between'} p={2}>
          <Box height={'100%'}  p={4}>
            <Typography><strong>Email:</strong> {partyContactAndLeaderDetails.email}</Typography>
            <Typography><strong>Phone:</strong> {partyContactAndLeaderDetails.phone}</Typography>
            <Typography><strong>Website:</strong> {partyContactAndLeaderDetails.website || "N/A"}</Typography>
            <Typography><strong>Leader Name:</strong> {partyContactAndLeaderDetails.leadername}</Typography>
            <Typography><strong>Founder Name:</strong> {partyContactAndLeaderDetails.foundername}</Typography>
            <Typography><strong>Manifesto:</strong> {partyContactAndLeaderDetails.manifesto}</Typography>
          </Box>
            {partyContactAndLeaderDetails.image && (
            <Box  height={'100%'} >
                <Typography><strong>Leader Image:</strong></Typography>
                <Avatar
                src={URL.createObjectURL(partyContactAndLeaderDetails.image)}
                alt="Leader"
                sx={{ width: 150, height: 150 ,mt: 2}}
                variant="rounded"
                />
            </Box>
            )}
        </Box>
        
        </Box>
        <Box display="flex" width="100%" justifyContent="space-between" mt={2}>
            <Button variant="outlined" onClick={onBack}> Back </Button>
            <Button variant="contained" loading={loading}  loadingPosition="end" onClick={onFinish}> Finish </Button>
        </Box>
    </Box>
    
  );
};

export default ReviewComponent;

import { Box, Button, Typography } from "@mui/material";

export default function StateCandidatesLayout() {
  
  return (
    <Box width="100%" height="100%" py={3} >
       <Box display="flex" flexDirection="row" alignItems="center" position="relative" width="100%">
            <Box position="absolute" left="50%" sx={{ transform: 'translateX(-50%)' }}>
                <Typography variant="h5" fontWeight={600} color="primary" textAlign="center">
                All State Candidates
                </Typography>
            </Box>
            <Box ml="auto">
                <Button variant="contained" color="primary">
                Add New Candidate
                </Button>
            </Box>
        </Box>

    </Box>
  );
}
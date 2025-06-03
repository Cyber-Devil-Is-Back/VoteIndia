import { Alert, Box, Button, MenuItem, Snackbar, Typography } from "@mui/material";
import ThickBorderTextField from "../CustomTextField";
import React from "react";

export default function NewElectionPage() {
    const [electionType, setElectionType] = React.useState<string>('');
    const [states, setStates] = React.useState<string[]>([]);
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [selctedState,setSelectedState] = React.useState<string>('');

    const fetchStates = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/states-uts`, {
                method: 'GET',
            });
            if (response.ok) {
                const data = await response.json();
                setStates(data);
                setSelectedState(data[0]);
            } else {
                const error = await response.json();
                console.error("Error fetching states:", error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };
    
    React.useEffect(() => {
        if (electionType === "Vidhan Sabha Election") {
            fetchStates();
        }
    }, [electionType]);
    const requestElectionDeployed = async () => {
        console.log(selctedState);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/election/deploy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    election_type:electionType === "Lok Sabha Elections" ? "LokSabha" : "VidhanSabha",
                    state: electionType === "Vidhan Sabha Election" ? selctedState : null,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setSnackbarMessage("Election deployed successfully!");
                setSnackbarOpen(true);
                console.log("Election deployed successfully:", data);
            } else {
                const error = await response.json();
                setSnackbarMessage("Error deploying election: " + error.message);
                setSnackbarOpen(true);
                console.error("Error deploying election:", error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
        setLoading(false);
    };
    const handleClick = () => {
        requestElectionDeployed();
        setLoading(true);
    };
    return (
        <Box width="100%" minHeight="100vh" display="flex" flexDirection="column" alignItems="center" pt={10}>
            <Typography variant="h4" fontWeight="bold" color="primary">
                New Election
            </Typography>
            <Typography variant="h6" color="text.secondary" mt={2}>
                Create a new election by filling out the form below.
            </Typography>
            <Box width="100%" maxWidth="400px" mt={4}>
                <ThickBorderTextField label="Election Type" variant="outlined" value={electionType} select onChange={(e: React.ChangeEvent<HTMLInputElement>) => setElectionType(e.target.value)} fullWidth sx={{ mt: 2 }}>
                    <MenuItem value="Lok Sabha Elections">Lok Sabha Elections</MenuItem>
                    <MenuItem value="Vidhan Sabha Election">Vidhan Sabha Election</MenuItem>
                </ThickBorderTextField>
                {electionType === "Vidhan Sabha Election" && (
                    <ThickBorderTextField label="State" variant="outlined" select value={selctedState} onChange={(e) => (setSelectedState(e.target.value))}  fullWidth sx={{ mt: 2 }} >
                        {states.sort().map((state: string) => (
                            <MenuItem key={state} value={state}>
                                {state}
                            </MenuItem>
                        ))}
                    </ThickBorderTextField>
                )}
                <Button variant="contained" color="primary" fullWidth sx={{mt: 4}} onClick={handleClick} loading={loading}>  Create Election </Button>
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={5000}   anchorOrigin={{ vertical:"top", horizontal:"center" }}  onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: '100%',color: 'white' }}> 
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

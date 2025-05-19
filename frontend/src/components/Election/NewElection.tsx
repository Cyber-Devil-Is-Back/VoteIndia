import { Box, Button, MenuItem, Typography } from "@mui/material";
import ThickBorderTextField from "../CustomTextField";
import React from "react";

export default function NewElectionPage() {
    const [electionType, setElectionType] = React.useState<string>('');
    const [states, setStates] = React.useState<string[]>([]);

    const fetchStates = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/states-uts`, {
                method: 'GET',
            });
            if (response.ok) {
                const data = await response.json();
                setStates(data);
            } else {
                const error = await response.json();
                console.error("Error fetching states:", error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    React.useEffect(() => {
        if (electionType === "Legislative Assembly Elections") {
            fetchStates();
        }
    }, [electionType]);

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
                    <MenuItem value="Legislative Assembly Elections">Legislative Assembly Elections</MenuItem>
                </ThickBorderTextField>

                {electionType === "Legislative Assembly Elections" && (
                    <ThickBorderTextField label="State" variant="outlined" select fullWidth sx={{ mt: 2 }}                    >
                        {states.map((state: string) => (
                            <MenuItem key={state} value={state}>
                                {state}
                            </MenuItem>
                        ))}
                    </ThickBorderTextField>
                )}
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }}>
                    Create Election
                </Button>
            </Box>
        </Box>
    );
}

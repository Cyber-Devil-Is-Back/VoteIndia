import React from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,Button,Typography,Box,Divider,Avatar,IconButton,Chip,} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

interface PartyReturn {
    _id: number;
    name: string;
    party_abbreviation: string;
    party_slogan: string;
    registration_on: string;
    party_description: string;
    party_type: string;
    party_email: string;
    party_website: string;
    phone_number: string;
    party_leader: string;
    party_founder: string;
    party_manifesto: string;
    party_logo: string;
    state: string;
    leader_image: string;
    status: string;
  }

interface PartyDialogProps {
    open: boolean;
    onClose: () => void;
    party: PartyReturn | null;
}

function PartyDialog({ open,onClose, party }: PartyDialogProps) {
    const [loading, setLoading] = React.useState(false);
    const [partyStatus, setPartyStatus] = React.useState<string | null>(null);
      
    const handleClick = async (event :React.MouseEvent<HTMLButtonElement>  ) => {
        setLoading(true);
        event.preventDefault();
        const target = event.currentTarget.textContent;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/update_status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: party?._id,         // Ensure this is a number (u64)
              status: target == "Approve" ? 'Approved' : 'Rejected'          // Make sure `target` matches your `PartyStatus` enum as a string
            }),
          });
        const data = await response.json();
        if (response.ok) {  
            setLoading(false);
            setPartyStatus("success");
            console.log('Party status updated successfully:', data);
        }
        else {
            setLoading(false);
            setPartyStatus("error");
            console.error('Error updating party status:', data);
        }
        onClose();
    }

    if (!party) {
        return null; // or a loading state
    }
    return (
        <Dialog open={open} maxWidth="md" fullWidth>
           <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar variant="rounded" src={`${process.env.NEXT_PUBLIC_API_URL}/${party.party_logo}`}  alt={party.name}  sx={{ width: 60, height: 60 }}  />
                    <Typography variant="h5">{party.name}</Typography>
                </Box>
                <IconButton onClick={onClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Party Overview   </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Abbreviation</Typography>
                            <Typography>{party.party_abbreviation}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Slogan</Typography>
                            <Typography>{party.party_slogan}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Type</Typography>
                            <Typography>{party.party_type}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">   Status </Typography>
                            <Chip  icon={<HourglassTopIcon fontSize="small" />}  label="Pending"  color="info"  size="small"  variant="outlined"  sx={{ fontWeight: 'bold' }}  />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">  Description </Typography>
                            <Typography>{party.party_description}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary"> Manifesto</Typography>
                            <Typography>{party.party_manifesto}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Leadership   </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Leader</Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar variant="rounded" src={`${process.env.NEXT_PUBLIC_API_URL}/${party.leader_image}`} alt={party.party_leader} />
                                <Typography>{party.party_leader}</Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Founder</Typography>
                            <Typography>{party.party_founder}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Contact & Registration   </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Email</Typography>
                            <Typography>
                                <a href={`mailto:${party.party_email}`}>{party.party_email}</a></Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Phone</Typography>
                            <Typography>{party.phone_number}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary"> Website</Typography>
                            <Typography>
                                <a href={party.party_website} target="_blank" rel="noopener noreferrer">
                                    {party.party_website}
                                </a></Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Registration Date</Typography>
                            <Typography>{party.registration_on}</Typography>
                        </Box>
                        {party.party_type === "National" ? ('') :(
                            <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                State</Typography>
                            <Typography>{party.state}</Typography>
                        </Box>
                        )}
                        
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClick } color="error" variant="outlined">
                    Reject
                </Button>
                <Button onClick={handleClick } color="primary" loading={loading} variant="contained">
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PartyDialog;
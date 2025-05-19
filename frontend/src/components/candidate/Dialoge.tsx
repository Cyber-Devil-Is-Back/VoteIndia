import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import ReasonDialog from "./ReasonDialog";

interface Candidate{
    id:number,
    name:string,
    gender:string,
    image:string,
    party_id:number,
    dob:string,
    state:string,
    district:string | null,
    constituency:string,
    status:string,
}

interface CandidateProps {
    data: Record<string,string|number>;
    open: boolean;
    updateLink: string;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Dialoge(props: CandidateProps) {
    const [party, setParty] = useState({
        party_name: '',
        party_image: '',
    });
    const [resaon,setReason] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const fetchParty = async () => {
        console.log(props.data);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/get_party_by_id/${props.data?.party_id}`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            setParty({
                party_name: data.name,
                party_image: data.logo,
            });
        } else {
            const error = await response.json();
            console.log(error);
        }
    }
   useEffect(() => {
        if (props.open && props.data?.party_id) {
            fetchParty();
        }
    }, [props.open]);

    const handleReject = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${props.updateLink}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.data['Candidate ID'],
                status: "Rejected",
                reason: resaon
            }),
        });
        if (response.ok) {
            setOpenDialog(false);
            props.setOpenDialog(false);
        } else {
            const error = await response.json();
            console.log(error);
        }
    }
    const handleApprove = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${props.updateLink}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.data['Candidate ID'],
                status: "Approved",
            }),
        });
        if (response.ok) {
            setOpenDialog(false);
            props.setOpenDialog(false);
        } else {
            const error = await response.json();
            console.log(error);
        }
    }
    return(
        <Box>
            <Dialog open={props.open}  fullWidth >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                    <Typography variant="h6" fontWeight={600} color='primary' > Candidates Details</Typography>
                    <IconButton onClick={ () => props.setOpenDialog(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box display='flex' justifyContent='space-between' alignItems='center' py={5} >
                        <Avatar src={`${process.env.NEXT_PUBLIC_API_URL}/${party.party_image}`} alt="Party Image" variant="rounded" style={{ width: '150px', height: '150px' }} />
                        <Avatar src={`${process.env.NEXT_PUBLIC_API_URL}/${props.data['Candidate Image']}`} alt="Candidate Image" variant="rounded" style={{ width: '150px', height: '150px' }} />
                    </Box>
                     <Box display='flex' gap={4} justifyContent={'space-between'} py={2}>
                        <Typography variant="body1" fontWeight={500} color='text.secondary' > Party Name: </Typography>
                        <Typography variant="body1" fontWeight={500} color='text.secondary' > {party.party_name} </Typography>
                    </Box>
                    {Object.entries(props.data)
                        .filter(([key, value]) => key !== "Candidate Image" && key !== "party_id" && value !== null && value !== undefined && value !== '' )
                        .map(([key, value]) => (
                            <Box key={key} display='flex' gap={4} justifyContent={'space-between'} py={2}>
                                <Typography variant="body1" fontWeight={500} color='text.secondary'>{key}: </Typography>
                                <Typography color="text.primary">{value}</Typography>
                            </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="error" onClick={() => setOpenDialog(true)} >
                        Reject
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleApprove} >
                        Approve
                    </Button>
                </DialogActions>


            </Dialog>
            <ReasonDialog open={openDialog} setOpen={setOpenDialog} reason={resaon} setReason={setReason} onContinue={handleReject} />
        </Box>
    )
}
export type {Candidate};
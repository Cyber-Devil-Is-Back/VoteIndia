import {  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, MenuItem, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThickBorderTextField from "@/components/CustomTextField";
import React from "react";
import PartySymbolPicker from "../../register/PartySymbolPicker";

interface AddDialogProps {
    open: boolean;
    onClose: () => void;
}
interface Form {
    party_id: string;
    name: string;   
    gender: string;
    dob: string;
    state: string;
    district: string;
    constituency: string;
}

export default function AddDialoge(props: AddDialogProps) {

    const [constituencyMap, setConstituencyMap] = React.useState<Record<string,string[]>>({});
    const [state, setState] = React.useState<string>("");
    const [image, setImage] = React.useState<File | null>(null);
    const [form, setform] = React.useState<Form>({
        party_id:'',
        name: '',
        gender:'',
        dob: '',
        state: state,
        district: '',
        constituency: '',
   
    });
    const loadconstituency = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/districts/?state=${form.state}`, {
            method: 'GET',
        });
        const data = await response.json();
        if (response.ok) {
            setConstituencyMap(data);
        } else {
            console.error('Error fetching constituency:', data.message);
        }
    }
    React.useEffect(() => {
        const storedState = sessionStorage.getItem("stateId");
        const storedPartyId = sessionStorage.getItem("partyId");

        if (storedState) {
            setState(storedState);
            setform((prevData) => ({
                ...prevData,
                state: storedState,
            }));
        }
        if (storedPartyId) {
            setform((prevData) => ({
                ...prevData,
                party_id: storedPartyId,
            }));
        }
    }, []);

// Run loadconstituency only when dialog is open and state is set
    React.useEffect(() => {
        if (props.open && form.state) {
            loadconstituency();
        }
    }, [props.open, form.state]);

    const handleadd = () => {
        const formData = new FormData();
        formData.append("party_id", sessionStorage.getItem('partyId') || '0');
        formData.append("name", form.name);
        formData.append("gender", form.gender);
        formData.append("dob", form.dob);
        formData.append("state", form.state);
        formData.append("district", form.district);
        formData.append("constituency", form.constituency);
        if (image) {
            formData.append("image", image);
        }
        const response = fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/candidate/register`, {
            method: 'POST',
            body: formData,
        }).then((response) => {
            if (response.ok) {
                console.log('Candidate added successfully');
                setImage(null);
                props.onClose();
            } else {
                console.error('Error adding candidate:', response.statusText);
            }
        }
        ).catch((error) => {
            console.error('Error:', error);
        }
        );
     
    }

   
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setform((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        console.log(form);
    };

    return(
        <Dialog open={props.open} fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Add New Candidate</Typography>
                    <IconButton onClick={props.onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <PartySymbolPicker defaultIcon={<AccountCircleIcon sx={{width:"100%",height:"100%",color:"black"}} />} size={200} onFileSelect={setImage} icon={image}/>
                <ThickBorderTextField label="Party ID" value={form.party_id} fullWidth disabled slotProps={{ inputLabel: { shrink: true } }}/>
                <ThickBorderTextField label="Name" fullWidth name="name" onChange={handleChange}/>
                <ThickBorderTextField label="Gender" fullWidth select onChange={handleChange} name="gender">
                    <MenuItem key="gender" value="Male" >Male</MenuItem>
                    <MenuItem key="genderfemale" value="Femaile" >Female</MenuItem>
                </ThickBorderTextField>
                <ThickBorderTextField label="Date of Birth" fullWidth type="date" slotProps={{ inputLabel: { shrink: true } }} onChange={handleChange} name="dob"/>
                <ThickBorderTextField label="State" fullWidth value={state} slotProps={{ inputLabel: { shrink: true } }} onChange={handleChange} name="state" >
                    </ThickBorderTextField>
                <ThickBorderTextField label="District" fullWidth select onChange={handleChange} name="district">
                    {Object.keys(constituencyMap).sort().map((constituency) => (
                        <MenuItem key={constituency} value={constituency}>{constituency}</MenuItem>
                    ))}
                    </ThickBorderTextField>
                <ThickBorderTextField label="Constituency" fullWidth select onChange={handleChange} name="constituency">
                    {constituencyMap[form.district]?.map((constituency) => (
                        <MenuItem key={constituency} value={constituency}>{constituency}</MenuItem>
                    ))}
                    </ThickBorderTextField>

            </DialogContent>
            <DialogActions sx={{mb: 2, mr: 2}}>
                <Button onClick={props.onClose} color="error">Cancel</Button>
                <Button onClick={handleadd} color="primary" variant="contained">Add Candidate</Button>
            </DialogActions>
        </Dialog>
    )
}
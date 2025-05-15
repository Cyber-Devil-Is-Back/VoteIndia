import { Dialog, DialogTitle, Typography, IconButton, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import ThickBorderTextField from "../CustomTextField";

interface Props{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    reason: string;
    setReason: React.Dispatch<React.SetStateAction<string>>;
    onContinue: () => void;
}

export default function ReasonDialog(props: Props) {


   return(
    <Dialog open={props.open} fullWidth >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                    <Typography variant="h6" fontWeight={600} color='primary' > Reason For Rejection</Typography>
                    <IconButton onClick={() => props.setOpen(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography>Please Enter the Reason For Rejection </Typography>
                    <ThickBorderTextField label="Reason For Rejection" variant="outlined" fullWidth multiline rows={4} sx={{ mt: 2 }} value={props.reason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setReason(e.target.value)}  />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" onClick={props.onContinue} >
                        Continue
                    </Button>
                </DialogActions>
           </Dialog>
   )
}
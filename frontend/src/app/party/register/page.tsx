'use client'

import {ColorlibConnector,ColorlibStepIcon, CustomStepLabel } from "@/components/parties/CustomSteeper";
import ContactDetails from "@/components/parties/register/ContactLogin";
import LeaderManifesto from "@/components/parties/register/LeaderManifesto";
import PartyRegistration from "@/components/parties/register/PartyRegistration";
import Review from "@/components/parties/register/Review";
import { PartyDetails, PartyContactAndLeaderDetails } from "@/components/parties/register/structs";
import {  Alert, Box, Snackbar, Step, Stepper, Typography} from "@mui/material"

import { AnimatePresence, motion } from "motion/react";
import React from "react";

const steps = ['Party Details', 'Contact & Login', 'Leadership & Manifestos','Review & Submit'];

const pageVariants = {
  initial: {
    x: '100%', // Start from the right
    opacity: 0,
  },
  animate: {
    x: 0, // Slide to the center
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '-100%', // Slide to the left when exiting
    opacity: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

export default function Register(){
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState(false);
  const [success, setSuccess] = React.useState<boolean|null>(null);

  const [partydetails, setPartyDetails] = React.useState<PartyDetails>({
    partyname: "", partyabbr: '', logo: null, slogan: '', date: '', partytype: '', state: '', desc: ''});

  const [partyContactAndLeaderDetails,setPartyConatctAndLeaderDetails ]= React.useState<PartyContactAndLeaderDetails>({
    email:"", password:"", confirmPassword:"", website:"", phone:"", leadername:"", foundername:"", manifesto:"", image: null});
  
  const handleFormDataChange = (field: string, value: string | File|  null) => {
    setPartyDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContrcatandLeaderDetaileChange = (field: string, value: string | File|  null) => {
    setPartyConatctAndLeaderDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    console.log(partyContactAndLeaderDetails)
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep !== 0) {
        return prevActiveStep - 1;
      }
      return prevActiveStep; // Return the same value if prevActiveStep is 0
    });
  };

  const handleFinish =async  () =>{

    const formdata = new FormData();
    formdata.append("party_name", partydetails.partyname);
    formdata.append("party_abbreviation", partydetails.partyabbr);
    formdata.append("party_slogan", partydetails.slogan);
    formdata.append("registration_date", partydetails.date);
    formdata.append("party_description", partydetails.desc);
    formdata.append("party_type", partydetails.partytype);
    formdata.append("state", partydetails.state || "");

    formdata.append("party_email", partyContactAndLeaderDetails.email);
    formdata.append("party_password", partyContactAndLeaderDetails.password);
    formdata.append("party_website", partyContactAndLeaderDetails.website || "");
    formdata.append("phone_number", partyContactAndLeaderDetails.phone);
    formdata.append("party_leader", partyContactAndLeaderDetails.leadername);
    formdata.append("party_founder", partyContactAndLeaderDetails.foundername);
    formdata.append("party_manifesto", partyContactAndLeaderDetails.manifesto);

// Append files (assuming File or Blob types)
    if (partydetails.logo) {
      formdata.append("party_logo", partydetails.logo);
    }

    if (partyContactAndLeaderDetails.image) {
      formdata.append("leader_image", partyContactAndLeaderDetails.image);
    }
  
    setLoading(true);
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/register`, {
      method: 'POST',
      body: formdata,
    })
    if (response.ok){
      setSnackbar(true);
      setSuccess(true);
      setLoading(false);
      setActiveStep(0);
      setPartyDetails({
        partyname: "", partyabbr: '', logo: null, slogan: '', date: '', partytype: '', state: '', desc: ''
      });
      setPartyConatctAndLeaderDetails({
        email:"", password:"", confirmPassword:"", website:"", phone:"", leadername:"", foundername:"", manifesto:"", image: null
      });
    }
    else{
      setSnackbar(true);
      setLoading(false);
      setSuccess(false);
    }

    
  }
  
  
  return (
    <Box  width='100vw' height='100vh' bgcolor='background' display='flex' alignItems='center' justifyContent='center'>
      <Box width='1500px' height='fit-content' bgcolor='white' borderRadius={5} boxShadow={3} display='flex' flexDirection='column' alignItems='center' padding='30px'>
        <Typography variant='h5' fontWeight='bold' mb={2}>Register your Party</Typography>
        
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />} sx={{width:'100%'}}>
          {steps.map((label) => (
            <Step key={label}>
              <CustomStepLabel StepIconComponent={ColorlibStepIcon} >{label}</CustomStepLabel>
            </Step>
          ))}
        </Stepper>


        <div className="registration-form-base">
          <AnimatePresence mode="wait">
          <motion.div key={activeStep} variants={pageVariants} initial="initial" animate="animate" exit="exit" >
            {activeStep === 0 ? (
                <PartyRegistration onClick={handleNext} data={partydetails} onChange={handleFormDataChange}  />
            ) : activeStep === 1 ? (
                <ContactDetails onNext={handleNext} onBack={handleBack} data={partyContactAndLeaderDetails} onChange={handleContrcatandLeaderDetaileChange} />
            ) : activeStep === 2 ? (
                <LeaderManifesto onNext={handleNext} onBack={handleBack}  data={partyContactAndLeaderDetails} onChange={handleContrcatandLeaderDetaileChange}  />
            ) : 
                <Review partydetails={partydetails} partyContactAndLeaderDetails={partyContactAndLeaderDetails} loading={loading} onBack={handleBack} onFinish={handleFinish}/>
            }
            </motion.div>
          </AnimatePresence>
          <Snackbar open={snackbar} autoHideDuration={600} anchorOrigin={{ vertical:'top', horizontal:'center' }} >
            <Alert
                variant="filled"
                sx={{ width: '100%',bgcolor: success ? 'green.500' : 'rgb(206, 43, 43)', color: 'white' }}
              >
                {success ? 'Party Registered Successfully' : 'This is an error '}
          </Alert>
          </Snackbar>
        </div>
      </Box> 
    </Box>
  )
}
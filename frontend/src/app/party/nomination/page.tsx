'use client';
import DashBoardLayout from "@/components/parties/DashBoardLayout";
import { Accordion, AccordionDetails, AccordionSummary, Avatar, MenuItem, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useEffect,useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThickBorderTextField from "@/components/CustomTextField";

export interface ElectionStateCandidate {
  id: number;
  party_id: string;
  name: string;
  image: string;
  state: string;
  district: string;
  constituency: string;
}

function getDistinctDistricts(data: ElectionStateCandidate[]): string[] {
  const districtSet = new Set<string>();
  data.forEach((item) => districtSet.add(item.district));
  return Array.from(districtSet);
}

export default function NominationPage() {
    const [candidates, setCandidates] = useState<ElectionStateCandidate[]>([]);
    const [partyType, setPartyType] = useState<string>('');
    const [selectedCandidates, setSelectedCandidates] = useState<{
    [district: string]: { [constituency: string]: string }; // candidate ID
    }>({});

    
    const fetchPartyData = async (id:string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/candidate/election_candidate/${id}`);
            if (!response.ok) {
                throw new Error(`Error fetching party data: ${response.statusText}`);
            }
            const partyData = await response.json();
            setCandidates(partyData);
            
        }
        catch (error) {
            console.error("Failed to fetch party data:", error);
        }
        
    };
   useEffect(() => {
        const storedPartyId = sessionStorage.getItem("partyId");
        const storedPartyType = sessionStorage.getItem("partyType");
        if (storedPartyType) {
            setPartyType(storedPartyType);
        } else {
            console.error("Party type not found in session storage.");
        }
        if (storedPartyId) {
            console.log(storedPartyId)
            fetchPartyData(storedPartyId);
        } else {
            console.error("Party ID not found in session storage.");
        }
    }, []);
    const handleSubmit = async () => {
      const payload = [];

      for (const district in selectedCandidates) {
          for (const constituency in selectedCandidates[district]) {
              payload.push({
                  district,
                  constituency,
                  candidateid: parseInt(selectedCandidates[district][constituency]), // Ensure ID is number
              });
          }
      }

      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/submit-nominations`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                  type: partyType.toLowerCase(),  // <-- Add this line
                  nominations: payload 
              }),
          });

          if (!response.ok) throw new Error("Failed to submit");

          alert("Nominations submitted successfully!");
          setSelectedCandidates({});
      } catch (err) {
          console.error("Submission error:", err);
          alert("Error submitting nominations.");
      }
  };



    return (
        <DashBoardLayout>
            <Box display="flex" flexDirection="column" alignItems="center" pt={4} height="100%">
              <Typography variant="h4" fontWeight="bold" color="primary" mb={2} textAlign="center">
                Nomination Page
              </Typography>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" width="100%" height="100%" overflow="auto" pt={5}>
              {getDistinctDistricts(candidates).map((district, index) => (
                <Accordion key={index} defaultExpanded={index === 0} sx={{ width: "100%" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {district}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Array.from(new Set(candidates.filter(c => c.district === district).map(c => c.constituency))).map((constituency, idx) => (
                      <ThickBorderTextField
                        key={idx}
                        sx={{ minWidth: 400 }}
                        label={constituency}
                        select
                        value={selectedCandidates[district]?.[constituency] || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setSelectedCandidates(prev => ({
                            ...prev,
                            [district]: {
                              ...(prev[district] || {}),
                              [constituency]: selectedId,
                            }
                          }));
                        }}
                      >
                        {candidates
                          .filter(c => c.district === district && c.constituency === constituency)
                          .map(candidate => (
                            <MenuItem key={candidate.id} value={candidate.id}>
                              <Box display="flex" alignItems="center">
                                <Avatar  src={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.image}`} alt={candidate.name}  style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}></Avatar>
                               
                                <Typography>{candidate.name}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                      </ThickBorderTextField>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
              {/* Submit Button */}
              <Box mt={4} mb={6}>
                <button
                  onClick={() => {
                    // Validate all fields selected
                    const allValid = getDistinctDistricts(candidates).every(district =>
                      Array.from(new Set(candidates.filter(c => c.district === district).map(c => c.constituency))).every(constituency =>
                        selectedCandidates[district]?.[constituency]
                      )
                    );

                    if (!allValid) {
                      alert("Please select a candidate for every constituency before submitting.");
                      return;
                    }

                    handleSubmit();
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Submit Nominations
                </button>
              </Box>
            </Box>
          </Box>

        </DashBoardLayout>
    )
}

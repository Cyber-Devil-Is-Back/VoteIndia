"use client";
import ThickBorderTextField from "@/components/CustomTextField";
import CandidateCard from "@/components/user/CandidateCard";
import { Avatar, Backdrop, Box, Button, CircularProgress, MenuItem, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as faceapi from 'face-api.js';
import { loadModel, areModelsLoaded } from '@/utils/FaceAuth';


interface Candidate {
    id:number;
    name: string;
    party_name: string;
    party_symbol: string;
    image: string;
}


export default function VotePage() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const[voterinfo,setVoterInfo] = useState({
    candidateid:"",
    wallet_address:"",
  });
  const faceDescriptorRef = useRef<number[]>([]);
  const [constituencyMap, setConstituencyMap] = useState<Record<string, string[]>>({});
  const [location, setLocation] = useState({ district: "", constituency: "" });
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [blur,setblur] = useState<boolean>(false);
  const [selected,setSelected] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('❌ Error accessing webcam:', error);
      alert("Please allow webcam to continue");
    }
  };

  async function initModels() {
        await loadModel();
        const loaded = await areModelsLoaded();
        if (loaded) {
          setIsModelLoaded(true);
          startVideo();
        }
      }

  const cosineSimilarity = (desc1: number[], desc2: number[]): number => {
      const dotProduct = desc1.reduce((sum, val, i) => sum + val * desc2[i], 0);
      const magnitude1 = Math.sqrt(desc1.reduce((sum, val) => sum + val ** 2, 0));
      const magnitude2 = Math.sqrt(desc2.reduce((sum, val) => sum + val ** 2, 0));
    
      if (magnitude1 === 0 || magnitude2 === 0) return 0; // Avoid division by zero
    
      return dotProduct / (magnitude1 * magnitude2);
    };
    
  // Load constituency map based on user's state
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    if (!user?.state) return;
    setVoterInfo({
      candidateid: user.id || "Unknown",
      wallet_address: user.wallet_address || "Unknown"
    });

    const loadConstituency = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/state/districts/?state=${user.state}`);
        const data = await response.json();

        if (response.ok) {
          setConstituencyMap(data);
          console.log(data)
        } else {
          console.error('Error fetching constituency:', data.message);
        }
      } catch (error) {
        console.error('Error loading constituency:', error);
      }
    };
    async function fetchdescriptor() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/face-descriptor/?id=${user.id}`);
      if (response.ok){
        const res = await response.json();
        
        const parsedArray: number[] = JSON.parse(res.face_descriptor); // Parse JSON string
        faceDescriptorRef.current = parsedArray;
        console.log(faceDescriptorRef.current)
      }
    }
    initModels();
    fetchdescriptor()
    loadConstituency();
  }, []);

  // Load candidates for selected district and constituency
  const loadCandidates = async () => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    if (!user?.state || !location.district || !location.constituency) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/get-candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: user.state,
          district: location.district,
          constituency: location.constituency,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCandidates(data.candidates || []);
        console.log(data) // Assuming the API returns an array of candidates
        // Save to state if needed
      } else {
        console.error('Error fetching candidates:', data.message);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  // Watch for district and constituency changes
  useEffect(() => {
    if (location.district && location.constituency) {
      loadCandidates();
    }
  }, [location.district, location.constituency]);

  const detectFace = async () => {
      if (!isModelLoaded || !videoRef.current) return;
  
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptors();
  
      if (detections.length === 1) {
      
        const similarity = cosineSimilarity(faceDescriptorRef.current, Array.from(detections[0].descriptor));
        console.log(similarity)
        if (similarity > 0.8){
         setblur(false);
        } else if (similarity > 0.5) {
          setMessage('⚠️ Face Recognized, but not a perfect match. Please try again.');
          setblur(true);
        }
        else {
          setMessage('❌ Face Not Recognized');
          setblur(true);
        }
  
      } else if (detections.length > 1) {
        setMessage('⚠️ Multiple Faces Detected! Only one person should be present.');
        setblur(true);
      } else {
        setMessage('❌ No Face Detected');
        setblur(true);
      }
    };
    useEffect(() => {
        const detctFace = async () => {
        if (!isModelLoaded) return;
        const interval = setInterval(detectFace, 1000);
        return () => clearInterval(interval);
        }
        detctFace();
      });

    const handleVoting = async () => {
      if (selected === 0) {
        alert("Please select a candidate to vote for.");
        return;
      }
      setblur(true);
      setMessage('Processing your vote...');
      try {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) return; 
        const user = JSON.parse(userStr);
        console.log(user)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_walletaddress: user.wallet_address,
            candidate_id: selected,
            district: location.district,
            constituency: location.constituency,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage('✅ Vote cast successfully!');
          setTimeout(() => {
            setblur(false);
            setMessage('');
          }, 2000);
        } else {
          setMessage(`❌ Error casting vote: ${data.message}`);   
          setTimeout(() => {
            setblur(false);
            setMessage('');
          }, 2000);
        }
      } catch (error) {
        console.error('Error casting vote:', error);
        setMessage('❌ Error casting vote. Please try again later.');
        setTimeout(() => {
          setblur(false);
          setMessage('');
        }, 2000);
      }
    };

  return(
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'rgba(255, 255, 255, 0.76)', padding: 2, border: '3px solid orange ' }}>
      <Box
        sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4}} >
        <Box width='600px' display={'flex'} gap={2} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant="h4" fontWeight={600} color='primary'> Voter Information </Typography>
          <Box display={'flex'}>
            <Avatar src='/images/user.png' alt='User Avatar' sx={{ width: 100, height: 100, marginRight: 2 }} />
          </Box>
          <Box display={'flex'} gap={1}>
            <Typography variant="body1" fontWeight={600}> Voter Name : </Typography>
            <Typography variant="body1"> {voterinfo.candidateid}  </Typography>
          </Box>
          <Box display={'flex'} gap={1}>
            <Typography variant="body1" fontWeight={600}> Wallet Address : </Typography>
            <Typography variant="body1"> {voterinfo.wallet_address}  </Typography>
          </Box>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: "center", textAlign: "center", justifyContent: 'center'}} >
          <Box component='img' src='/images/election.png' width='100px' sx={{ marginBottom: 2 }} />
          <Typography fontWeight={800} variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', background: 'linear-gradient(to right, #FF9933, blue, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', display: 'inline-block' }}>
             Vote India
          </Typography>
          <Typography variant="h5" fontWeight={600} color='primary'>
            Voting is not just a right, it &apos;s a responsibility.
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Your vote matters. Make it count!
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ p: 2 }}>
          <Box component="video" ref={videoRef} autoPlay muted playsInline sx={{ width: 200, height: 200, border: '4px dashed #1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(25, 118, 210, 0.05)', position: 'relative', boxShadow: 2, mb: 2, }} >
          </Box>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 220 }}>
            Please align your face within the Box for identity verification.
          </Typography>
        </Box>
      </Box>
      <Box display='flex'  width='100%'  justifyContent='center' alignItems='center' flexWrap='wrap' >
        <ThickBorderTextField label="District" value={location.district} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(prevData => ({ ...prevData, district: e.target.value }))} select sx={{marginRight: 2,width:"400px"}} >
          {Object.keys(constituencyMap).sort().map((district) => (
                        <MenuItem key={district} value={district}>{district}</MenuItem>
                    ))}
        </ThickBorderTextField>
        <ThickBorderTextField label="Constituency" select value={location.constituency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(prevData => ({ ...prevData, constituency: e.target.value }))} sx={{marginLeft: 2,width:"400px"}}  >
                {constituencyMap[location.district]?.map((constituency) => (
                                        <MenuItem key={constituency} value={constituency}>{constituency}</MenuItem>
                                    ))}
        </ThickBorderTextField>
      </Box>
      { location.district && location.constituency && (
        <Box display="flex" flexDirection="row" flexWrap="nowrap" justifyContent="flex-start" alignItems="flex-start" sx={{ marginTop: 1, gap: 2, overflowX: 'auto', padding: 2,}}>
         {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                id={candidate.id}
                name={candidate.name}
                selected={selected === candidate.id}
                party_name={candidate.party_name}
                party_symbol={candidate.party_symbol}
                image={candidate.image}
                onClick={() => (setSelected(candidate.id))}
              />
            ))
          ) : (
            <Typography variant="h6" color="textSecondary">
              No candidates found for the selected district and constituency.
            </Typography>
          )}
        
        </Box>
        
      )}
      <Box display='flex' width='100%' alignItems='center' justifyContent='center'>

         <Button variant="contained"><Typography variant="h6" fontWeight={900} onClick={handleVoting}> vote</Typography></Button>
      </Box>
      <Backdrop  sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1,display:"flex",flexDirection:'column',gap:3 })} open={blur}>
        <Typography variant="h3" fontWeight={900}> {message}  </Typography>
        <CircularProgress size={80} color="inherit" />
      </Backdrop>

        
    </Box>
  )
}
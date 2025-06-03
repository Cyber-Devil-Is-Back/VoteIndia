'use client';
import React, { useState } from 'react';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
} from '@mui/material';

const districts = ['District A', 'District B', 'District C'];
const constituencies = {
  'District A': ['Constituency A1', 'Constituency A2'],
  'District B': ['Constituency B1', 'Constituency B2'],
  'District C': ['Constituency C1', 'Constituency C2'],
};

const candidates = [
  {
    id: 1,
    name: 'Alice Johnson',
    party: 'Party Alpha',
    photo: '/images/alice.jpg',
    symbol: '/images/alpha.png',
    district: 'District A',
    constituency: 'Constituency A1',
  },
  {
    id: 2,
    name: 'Bob Smith',
    party: 'Party Beta',
    photo: '/images/bob.jpg',
    symbol: '/images/beta.png',
    district: 'District A',
    constituency: 'Constituency A1',
  },
  // Add more candidates as needed
];

export default function VotingPage() {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
    setSelectedConstituency('');
    setSelectedCandidateId(null);
  };

  const handleConstituencyChange = (event) => {
    setSelectedConstituency(event.target.value);
    setSelectedCandidateId(null);
  };

  const handleCandidateSelect = (id) => {
    setSelectedCandidateId(id);
  };

  const handleSubmitVote = () => {
    if (selectedCandidateId) {
      const candidate = candidates.find((c) => c.id === selectedCandidateId);
      alert(`You have voted for ${candidate.name} of ${candidate.party}`);
      // Integrate blockchain vote submission logic here
    } else {
      alert('Please select a candidate before submitting your vote.');
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.district === selectedDistrict &&
      c.constituency === selectedConstituency
  );

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Blockchain Voting System
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="district-label">District</InputLabel>
          <Select
            labelId="district-label"
            value={selectedDistrict}
            label="District"
            onChange={handleDistrictChange}
          >
            {districts.map((district) => (
              <MenuItem key={district} value={district}>
                {district}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedDistrict}>
          <InputLabel id="constituency-label">Constituency</InputLabel>
          <Select
            labelId="constituency-label"
            value={selectedConstituency}
            label="Constituency"
            onChange={handleConstituencyChange}
          >
            {selectedDistrict &&
              constituencies[selectedDistrict].map((constituency) => (
                <MenuItem key={constituency} value={constituency}>
                  {constituency}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {selectedDistrict && selectedConstituency && (
        <>
          <Typography variant="h5" gutterBottom>
            Candidates
          </Typography>
          <Grid container spacing={3}>
            {filteredCandidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                <Card
                  sx={{
                    border:
                      selectedCandidateId === candidate.id
                        ? '2px solid #1976d2'
                        : '1px solid #ccc',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCandidateSelect(candidate.id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={candidate.photo}
                    alt={candidate.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{candidate.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <img
                        src={candidate.symbol}
                        alt={candidate.party}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                      />
                      <Typography variant="body2">{candidate.party}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitVote}
              disabled={!selectedCandidateId}
            >
              Submit Vote
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}


// can you suggest me layout for voting page for user based on my blockchain voting systems
//  in which i will give option user to select option to select district and constutuiency and then optin 
//  to select their desired candidates displayed with party symbol and their photos 
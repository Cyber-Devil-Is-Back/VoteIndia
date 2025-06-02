'use client'
// pages/constituencies.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, TextField, Box, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';

const data = [
  {
    district: 'District A',
    constituencies: ['Constituency A1', 'Constituency A2'],
  },
  {
    district: 'District B',
    constituencies: ['Constituency B1', 'Constituency B2', 'Constituency B3'],
  },
  // Add more districts...
];

export default function ConstituencyPage() {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(d =>
    d.district.toLowerCase().includes(search.toLowerCase()) ||
    d.constituencies.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box px={4} py={2} width="100%" maxWidth="800px" mx="auto">
      <Typography variant="h4" mb={2}>Choose Your Constituency</Typography>

      <TextField
        fullWidth
        label="Search by district or constituency"
        variant="outlined"
        margin="normal"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredData.map((district, idx) => (
        <Accordion key={idx} defaultExpanded={idx === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{district.district}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {district.constituencies.map((name, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  
                >
                  {name}
                </Button>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

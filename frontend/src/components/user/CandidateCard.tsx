import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";

interface Candidate {
  id: number;
  name: string;
  party_name: string;
  party_symbol: string;
  image: string;
  selected: boolean;
  onClick: () => void;
}

export default function CandidateCard(props: Candidate) {
  return (
    <Card onClick={props.onClick} sx={{ minWidth: 300, maxWidth: 345, margin: 2, boxShadow: props.selected ? 6 : 3, borderRadius: 2, border: props.selected ? "3px solid #1976d2" : "1px solid #ccc", cursor: "pointer", transition: "0.3s",}}>
      <CardMedia sx={{ height: 250 }} image={`${process.env.NEXT_PUBLIC_API_URL}/${props.image}`} title={props.name} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" fontWeight={600} textAlign={"center"}>
          {props.name}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center">
          <img src={`${process.env.NEXT_PUBLIC_API_URL}/${props.party_symbol}`} alt="Party Symbol" style={{ width: "50px", height: "50px" }}/>
          <Typography variant="body2" color="text.secondary" fontWeight={900} sx={{ marginLeft: 2 }} >
            {props.party_name}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

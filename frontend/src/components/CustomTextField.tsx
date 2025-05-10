import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const ThickBorderTextField = styled((props: TextFieldProps) => (
  <TextField {...props} variant="outlined" />
))(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderWidth: '3px', // Thicker border
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '3px',
    },
  },
}));
export default ThickBorderTextField;
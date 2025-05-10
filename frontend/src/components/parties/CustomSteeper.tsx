import * as React from 'react';
import Check from '@mui/icons-material/Check';
import { styled } from '@mui/material/styles';

import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepLabel } from '@mui/material';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#2196f3', // Blue for active
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#4caf50', // Green for completed
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
    ...(theme.palette.mode === 'dark' && {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));

const ColorlibStepIconRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'ownerState',
})<{ ownerState: { completed?: boolean; active?: boolean } }>(({ theme, ownerState }) => ({
  backgroundColor: '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(theme.palette.mode === 'dark' && {
    backgroundColor: theme.palette.grey[700],
  }),
  ...(ownerState.active && {
    backgroundColor: '#2196f3', // Blue for active
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor: '#4caf50', // Green for completed
  }),
}));

interface ColorlibStepIconProps {
  active?: boolean;
  completed?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

function ColorlibStepIcon(props: ColorlibStepIconProps) {
  const { active, completed, className } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <Check /> : props.icon}
    </ColorlibStepIconRoot>
  );
}

const CustomStepLabel = styled(StepLabel)(() => ({
  '& .MuiStepLabel-label': {
    color: '#666',
  },
  '&.Mui-active .MuiStepLabel-label': {
    color: '#2196f3', // Blue for active label
    fontWeight: 600,
  },
  '&.Mui-completed .MuiStepLabel-label': {
    color: '#4caf50', // Green for completed label
  },
}));

export { ColorlibStepIcon, ColorlibConnector, CustomStepLabel };

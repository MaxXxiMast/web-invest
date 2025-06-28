import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const GripLoading = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 500,
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default GripLoading;

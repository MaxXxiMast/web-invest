import Box from '@mui/material/Box';
import CircularProgress, {
  circularProgressClasses,
} from '@mui/material/CircularProgress';

function CircularProgressMeter({
  size = 32,
  thickness = 7,
  progressColor = '#00357c',
  progressMeterColor = '#EEEEEE',
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        transform: 'scale(-1, 1)',
        width: 'max-content',
      }}
    >
      <CircularProgress
        variant="determinate"
        sx={{
          color: progressMeterColor,
        }}
        size={size}
        thickness={thickness}
        value={100}
      />
      <CircularProgress
        sx={{
          color: progressColor,
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {},
        }}
        size={size}
        thickness={thickness}
      />
    </Box>
  );
}

export default CircularProgressMeter;

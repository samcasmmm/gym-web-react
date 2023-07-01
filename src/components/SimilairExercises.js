import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import HorizontalScollbar from './HorizontalScollbar';
import Loader from './Loader';

const SimilairExercises = ({ targetMuscleVideo, equipmentExericses }) => {
  return (
    <Box sx={{ mt: { lg: '100px', xs: '0' } }}>
      <Typography variant='h3' mb={5}>
        Exercises That Target The Same Muscle Group
      </Typography>
      <Stack direction='row' sx={{ p: '2', position: 'relative' }}>
        {targetMuscleVideo.length ? (
          <HorizontalScollbar data={targetMuscleVideo} />
        ) : (
          <Loader />
        )}
      </Stack>

      <Typography variant='h3' mb={5}>
        Exercises That Use The Same Equipment Group
      </Typography>
      <Stack direction='row' sx={{ p: '2', position: 'relative' }}>
        {targetMuscleVideo.length ? (
          <HorizontalScollbar data={equipmentExericses} />
        ) : (
          <Loader />
        )}
      </Stack>
    </Box>
  );
};

export default SimilairExercises;

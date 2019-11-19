import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import yarns from 'yarns.json';
import SelectableChip from './components/SelectableChip';
import { Paper } from '@material-ui/core';

export default function App() {
  const [selectedWeight, setSelectedWeight] = useState<string>('Aran');

  const handleWeightClick = () => {};

  return (
    <Box height="100vh">
      <Box p="16px" display="flex" flexWrap="wrap">
        {[
          'Thread',
          'Cobweb',
          'Lace',
          'Light Fingering',
          'Fingering',
          'Sport',
          'DK',
          'Worsted',
          'Aran',
          'Bulky',
          'Super Bulky',
          'Jumbo',
        ].map(weight => (
          <Box mr="8px" mb="8px">
            <SelectableChip key={weight} label={weight} onClick={handleWeightClick} />
          </Box>
        ))}
      </Box>
      <Box p="16px">
        {yarns.Aran.map(yarn => (
          <Paper>
            <Box height="100px">{yarn.name}</Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

import Chip from '@material-ui/core/Chip';
import React from 'react';

export default function SelctableChip({ selected, label, onClick, ...props }: any) {
  return (
    <Chip color={selected ? 'primary' : 'default'} variant="outlined" label={label} onClick={onClick} {...props} />
  );
}

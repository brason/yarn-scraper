import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import yarnsJson from 'yarns.json';
import SelectableChip from './components/SelectableChip';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { useHistory, useParams } from 'react-router';

type YarnWeight =
  | 'Lace'
  | 'Light Fingering'
  | 'Fingering'
  | 'Sport'
  | 'DK'
  | 'Worsted'
  | 'Aran'
  | 'Bulky'
  | 'Super Bulky';

interface YarnData {
  discontinued: boolean;
  gauge_divisor: number;
  grams: number;
  machine_washable?: boolean;
  max_gauge: number;
  min_gauge: number;
  name: string;
  rating_average: number;
  rating_count: number;
  rating_total: number;
  texture: string;
  thread_size?: number;
  yardage: number;
  min_needle_size?: {
    metric: string;
  };
  max_needle_size?: {
    metric: string;
  };
  yarn_weight: {
    name: YarnWeight;
    ply: string;
    wpi: number;
    min_gauge?: number;
    max_gauge?: number;
  };
  yarn_company: {
    name: string;
  };
  photos?: {
    medium2_url: string;
  }[];
  yarn_fibers: {
    fiber_category: {
      name: string;
      synthetic: boolean;
      vegetable_fiber: boolean;
      animal_fiber: boolean;
    };
    fiber_type: {
      name: string;
    };
    percentage: number;
  }[];
}

interface Yarn {
  link: string;
  data: YarnData;
}

export default function App() {
  const history = useHistory();
  const params = useParams<{ yarn: string }>();

  const yarnWeight = params.yarn ? (decodeURIComponent(params.yarn) as YarnWeight) : 'Lace';

  const handleWeightClick = (weight: YarnWeight) => () => {
    history.push(`/${encodeURIComponent(weight)}`);
  };

  const handleYarnClick = (link: string) => () => {
    window.location.assign(link);
  };

  const yarns = yarnsJson[yarnWeight] as Yarn[];

  return (
    <Box height="100vh">
      <Box p="8px" display="flex" flexWrap="wrap">
        {['Lace', 'Light Fingering', 'Fingering', 'Sport', 'DK', 'Worsted', 'Aran', 'Bulky', 'Super Bulky'].map(
          weight => (
            <Box key={weight} mr="8px" mb="8px">
              <SelectableChip
                selected={yarnWeight === weight}
                key={weight}
                label={weight}
                onClick={handleWeightClick(weight as YarnWeight)}
              />
            </Box>
          ),
        )}
      </Box>
      <List>
        {yarns.map(yarn => (
          <ListItem key={yarn.link} onClick={handleYarnClick(yarn.link)} button>
            <ListItemAvatar>
              <Avatar src={yarn.data.photos?.[0]?.medium2_url} />
            </ListItemAvatar>
            <ListItemText
              primary={`${yarn.data.name} (${yarn.data.yarn_company.name})`}
              secondary={
                <>
                  <Typography>
                    {yarn.data.yarn_fibers.map(fiber => `${fiber.percentage}% ${fiber.fiber_type.name}`).join(', ')}
                  </Typography>
                  <Typography>Length: {Math.round(yarn.data.yardage / 1.094)}m</Typography>
                  <Typography>
                    Needle size: {yarn.data.min_needle_size?.metric}
                    {yarn.data.max_needle_size?.metric ? `-${yarn.data.max_needle_size.metric}mm` : 'mm'}
                  </Typography>
                  <Typography>
                    Gauge: {yarn.data.min_gauge}
                    {yarn.data.max_gauge ? `-${yarn.data.max_gauge}` : ''}
                  </Typography>
                  <Typography>Ply: {yarn.data.yarn_weight.ply}</Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

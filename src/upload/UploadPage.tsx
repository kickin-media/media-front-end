import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary';
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const testData: { name: string[], count: number }[] = [
  { name: ['Kick-In 2021', 'Dag 1', 'Opening Show'], count: 80 },
  { name: ['Kick-In 2021', 'Dag 1', 'Opening Market'], count: 27 },
  { name: ['Kick-In 2021', 'Dag 1', 'Do-group Market'], count: 18 },
];

const UploadPage: React.FC = () => {

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <ImageList cols={4}>
          {new Array(40).fill(null).map((item, index) => (
            <ImageListItem key={index}>
              <img src={`https://picsum.photos/200/200?index=${index}`} alt="Image" />
            </ImageListItem>
          ))}
        </ImageList>
      </Grid>

      <Grid item xs={6}>
        {testData.map((item, index) => (
          <Accordion key={item.name.join('/')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Breadcrumbs>
                {item.name.map((sub, index) => <Typography key={index}>{sub}</Typography>)}
              </Breadcrumbs>
              {/*<Typography sx={{ color: 'text.secondary' }}>{item.count} images</Typography>*/}
            </AccordionSummary>
            <AccordionDetails>
              <ImageList cols={8}>
                {new Array(10).fill(null).map((item, index) => (
                  <ImageListItem key={index}>
                    <img src={`https://picsum.photos/200/200?index=${index}`} alt="Image" />
                  </ImageListItem>
                ))}
              </ImageList>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    </Grid>
  );
};

export default UploadPage;

import React from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Routes from './routes';

const App = () => (
  <>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <Routes />
    </ThemeProvider>
  </>
);

const theme = createTheme({
  mixins: { toolbar: { minHeight: 73 } }
});

export default App;

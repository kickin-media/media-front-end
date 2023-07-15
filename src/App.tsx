import React, { useState } from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Routes from './routes';
import { BreadcrumbContext } from "./components/ui/Breadcrumb";

const App = () => {
  const [breadcrumb, setBreadcrumb] = useState<{ name: string, href: string }[]>([]);

  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <BreadcrumbContext.Provider value={{ path: breadcrumb, setPath: (...path) => setBreadcrumb(path) }}>
          <Routes />
        </BreadcrumbContext.Provider>
      </ThemeProvider>
    </>
  );
}

const theme = createTheme({
  mixins: { toolbar: { minHeight: 73 } },
  palette: {
    primary: {
      main: '#12ad2b',
      light: '#5ce05c',
      dark: '#007c00',
      contrastText: '#fff'
    },
    secondary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#fff'
    }
  }
});

export default App;

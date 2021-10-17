import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import { compose } from 'redux';
import { Link as RouterLink, RouteComponentProps, withRouter } from 'react-router-dom';

import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText';
import MUILink from '@mui/material/Link';
import Portal from '@mui/material/Portal';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import AccountIcon from '@mui/icons-material/AccountCircle';
import AlbumIcon from '@mui/icons-material/PhotoLibrary';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';

import classes from './AppUI.module.scss';
import logo from '../../res/images/logo-white.png';

const menu: { label: string, target?: string | (() => void), icon?: React.ReactNode }[] = [
  {label: 'Home', target: '/', icon: <HomeIcon />},
  {label: 'Foto\'s', target: '/albums/', icon: <AlbumIcon />},
  {label: 'Media Crew', target: '/media/', icon: <InfoIcon />},
];


// ##
// # REGIONS
// ##
const RegionContext = React.createContext<RegionContextType>({});
type RegionContextType = {[key:string]: any};

export const Region: React.FC<{ children: React.ReactNode, name: string }> = (props) => (
  <RegionContext.Consumer>
    {context => context[props.name].current ? (<Portal container={context[props.name].current}>{props.children}</Portal>) : null}
  </RegionContext.Consumer>
);


// ##
// # BREADCRUMB
// ##
const Link = ((props: any) => <MUILink {...props} component={RouterLink} />) as unknown as (typeof RouterLink);


// ##
// # APPLICATION UI
// ##
const AppUI: React.FC<RouteComponentProps & Props> = ({children, history}) => {
  const hero = useRef();

  // Save the component's state
  const [drawer, setDrawer] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Add onscroll behaviour
  const onScroll = () => setScrolled(window.scrollY > 0);
  useEffect(() => {
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  });

  // Determine the layout (mobile vs desktop)
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  // Automatically close the menu drawer if the browser switches to desktop layout
  useEffect(() => {
    if (desktop) setDrawer(false);
  }, [desktop])

  return (
    <RegionContext.Provider value={{hero}}>
      <AppBar position="fixed" classes={{ root: clsx(classes.header, { [classes.scrolled]: scrolled })}}>
        <Container maxWidth="xl" disableGutters>
          <Toolbar className={clsx({[classes.mobile]: !desktop})}>
            {desktop ? null : (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{mr: 2}}
                onClick={() => setDrawer(true)}
              >
                <MenuIcon/>
              </IconButton>
            )}

            <img className={classes.logo} src={logo} alt="Kick-In logo"/>

            {desktop ? (
              <Box className={classes['account-wrapper']}>
                {menu.map((item, index) => (
                  <Button
                    key={index}
                    className={classes['nav-button']}
                    color="inherit"
                  >
                    {item.label}
                  </Button>
                ))}
                <IconButton
                  size="large"
                  color="inherit"
                >
                  <AccountIcon/>
                </IconButton>
              </Box>
            ) : null}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="left" open={drawer} onClose={() => setDrawer(false)}>
        <List>
          {menu.map((item, index) => (
            <ListItem key={index} button onClick={typeof item.target === "function" ? item.target : () => {
              if (!item.target) return;
              history.push(item.target as string);
            }}>
              {item.icon ? (<ListItemIcon>{item.icon}</ListItemIcon>) : null}
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box ref={hero} />

      <Container maxWidth="xl">
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/">Home</Link>
          <Link to="/kick-in2022">Kick-In 2022</Link>
          <Typography>Uploaden</Typography>
        </Breadcrumbs>

        {children}
      </Container>
    </RegionContext.Provider>
  );
};

interface Props {
  children?: React.ReactNode;
}

export default compose(
  withRouter
)(AppUI) as unknown as React.FC;

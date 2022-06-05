import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText';
import Portal from '@mui/material/Portal';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';

import AccountIcon from '@mui/icons-material/AccountCircle';
import AlbumIcon from '@mui/icons-material/Album';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';

import classes from './AppUI.module.scss';
import logo from '../../res/images/logo-white.png';
import { login, logout } from "../../redux/actions/auth";
import { StateType } from "../../redux/reducers/reducers";
import DropEmLikeItsHot from "../../upload/components/DropEmLikeItsHot";
import AdminSpeedDial from "../../admin/components/AdminSpeedDial";
import { usePageTracking } from "../../util/analytics";

const menu: { label: string, target: string, icon?: React.ReactNode }[] = [
  {label: 'Home', target: '/', icon: <HomeIcon />},
  {label: 'Events', target: '/event/', icon: <AlbumIcon />},
  // {label: 'Media Crew', target: '/media/', icon: <InfoIcon />},
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
// # APPLICATION UI
// ##
const AppUI: React.FC<Props> = ({children}) => {
  const hero = useRef();

  const history = useHistory();
  usePageTracking();

  const dispatch = useDispatch();
  const user = useSelector((state: StateType) => state.auth.authenticated ? state.auth.user : undefined, shallowEqual);

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
  }, [desktop]);

  return (
    <RegionContext.Provider value={{hero}}>
      {/* Hero region */}
      <Box className={classes.hero} ref={hero} sx={{ minHeight: theme.mixins.toolbar.minHeight, marginBottom: theme.spacing(2) }} />

      {/* Header (menu/navigation) */}
      <AppBar position="fixed" classes={{ root: clsx(classes.header, { [classes.scrolled]: scrolled })}}>
        <Container maxWidth="lg" disableGutters>
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

            <img
              className={classes.logo}
              src={logo}
              alt="Kick-In logo"
              onClick={() => history.push('/')}
            />

            {desktop ? (
              <Box className={classes['account-wrapper']}>
                {menu.map((item, index) => (
                  <Button
                    key={index}
                    className={classes['nav-button']}
                    color="inherit"
                    component="a"
                    href={item.target}
                    onClick={(e: any) => {
                      e.preventDefault();
                      history.push(item.target);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                {user ? (
                  <Button
                    className={classes['user-menu']}
                    color="inherit"
                    variant="outlined"
                    endIcon={<Avatar alt={user.name} src={user.picture} sx={{width: 24, height: 24}} />}
                    onClick={() => dispatch(logout(window.location.origin))}
                  >
                    {user.name}
                  </Button>
                ) : (
                  <Tooltip title="Log in">
                    <IconButton
                      size="large"
                      color="inherit"
                      onClick={() => dispatch(login(document.location.origin))}
                    >
                      <AccountIcon/>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ) : null}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Navigation drawer (for mobile) */}
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

      {/* Content */}
      <Container maxWidth="lg" className={classes.content}>
        <Alert className={classes.alert} severity="info">
          <b>Kick-In Media Site - Testing Phase</b><br />
          This media site (<a href="https://www.kick-in.media/">kick-in.media</a>) is currently in a testing phase;
          this means that this app is currently in development, but we would love to get feedback from you! If you have
          the time, you can fill in <a href="https://forms.gle/DccESdS33oKog1Tm8">this form</a> (takes max. 5 minutes)
          or send an e-mail to <a href="mailto:feedback@kick-in.media">feedback@kick-in.media</a>.
        </Alert>

        {children}
      </Container>

      {/* Footer */}
      <div className={classes.footer}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <img src={logo} alt="Kick-In logo"/>
            </Grid>
            <Grid item xs={12} md={6}>
              <b>Kick-In Media App</b><br />
              <a href="https://www.kick-in.nl">Kick-In Website</a><br />
              <a href="mailto:feedback@kick-in.media">feedback@kick-in.media</a><br />
              <a href="https://github.com/kickin-media">GitHub</a>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Others */}
      <AdminSpeedDial />
      {user !== undefined ? <DropEmLikeItsHot /> : null}
    </RegionContext.Provider>
  );
};

interface Props {
  children?: React.ReactNode;
}

export default AppUI;

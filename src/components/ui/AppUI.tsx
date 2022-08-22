import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import MobileNav from './MobileNav';
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
import CookieDialog from "../dialogs/CookieDialog";

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

  const loadedCookieSetting = window.localStorage.getItem('cookies');
  const [cookieDialog, setCookieDialog] = useState<boolean>(loadedCookieSetting === null);

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

      <MobileNav
        open={drawer}
        onClose={() => setDrawer(false)}
        items={menu}
        user={user}
      />

      {/* Content */}
      <Container maxWidth="lg" className={classes.content}>
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
              <em>
                If you want a photo to be removed, please send an e-mail to the{" "}
                <a href="mailto:info@kick-in.nl">Kick-In committee</a>.
              </em><br />
              <br />
              <a href="https://www.kick-in.nl">Kick-In Website</a><br />
              <a href="mailto:feedback@kick-in.media">feedback@kick-in.media</a><br />
              {/*<a href="https://github.com/kickin-media">GitHub</a>*/}
              <br />
              <em>&copy; 2022 <a href="https://github.com/jonathanjuursema">Jonathan Juursema</a> &amp;{" "}
              <a href="https://github.com/jeffreybakker">Jeffrey Bakker</a></em>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Others */}
      <AdminSpeedDial />
      {user !== undefined ? <DropEmLikeItsHot /> : null}
      <CookieDialog open={cookieDialog} onClose={() => {
        setCookieDialog(false);
        window.localStorage.setItem('cookies', 'Helemaal priem joh, doe lekker je functionele koekjes bij mij ' +
          'installeren, mij hoor je niet klagen');
      }} />
    </RegionContext.Provider>
  );
};

interface Props {
  children?: React.ReactNode;
}

export default AppUI;

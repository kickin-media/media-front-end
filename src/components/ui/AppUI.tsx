import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link as RouterLink, RouteComponentProps, withRouter } from 'react-router-dom';

import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AccountIcon from '@mui/icons-material/AccountCircle';
import AlbumIcon from '@mui/icons-material/PhotoLibrary';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';

import classes from './AppUI.module.scss';
import logo from '../../res/images/logo-white.png';
import { login } from "../../redux/actions/auth";
import { UserType } from "../../redux/reducers/auth";
import { StateType } from "../../redux/reducers/reducers";
import DropEmLikeItsHot from "../../upload/components/DropEmLikeItsHot";

const menu: { label: string, target: string, icon?: React.ReactNode }[] = [
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
const AppUI: React.FC<ReduxProps & RouteComponentProps & Props> = ({children, history, login, user}) => {
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

            <img className={classes.logo} src={logo} alt="Kick-In logo"/>

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
                    color="inherit"
                    variant="outlined"
                    endIcon={<Avatar alt={user.name} src={user.picture} sx={{width: 24, height: 24}} />}
                  >
                    {user.name}
                  </Button>
                ) : (
                  <Tooltip title="Log in">
                    <IconButton
                      size="large"
                      color="inherit"
                      onClick={() => login(document.location.origin)}
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
      <Container maxWidth="lg">
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/">Home</Link>
          <Link to="/kick-in2022">Kick-In 2022</Link>
          <Typography>Uploaden</Typography>
        </Breadcrumbs>

        {children}
      </Container>

      {/* Others */}
      <DropEmLikeItsHot />
    </RegionContext.Provider>
  );
};

interface Props {
  children?: React.ReactNode;
}

interface ReduxProps {
  login: typeof login;

  user?: UserType;
}

export default compose(
  withRouter,
  connect((state: StateType) => ({
    user: state.auth.authenticated ? state.auth.user : undefined,
  }), (dispatch) => ({
    login: (redirectUri?: string) => dispatch(login(redirectUri)),
  }))
)(AppUI) as unknown as React.FC<Props>;

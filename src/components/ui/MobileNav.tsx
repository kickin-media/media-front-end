import React from 'react';
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Tooltip from "@mui/material/Tooltip";

import AccountIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from '@mui/icons-material/Close';

import { login, logout } from "../../redux/actions/auth";
import { UserType } from "../../redux/reducers/auth";

import classes from './MobileNav.module.scss';
import logo from "../../res/images/logo-white.png";

const MobileNav: React.FC<Props> = ({ open, onClose, items, user }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <Modal open={open} onClose={() => {}}>
      <div className={classes.root}>
        <img
          className={classes.logo}
          src={logo}
          alt="Kick-In logo"
          onClick={() => history.push('/')}
        />

        {items.map(item => (
          <Button
            key={item.label + item.target}
            onClick={() => {
              history.push(item.target);
              onClose();
            }}
          >
            {item.label}
          </Button>
        ))}

        {user ? (
          <Button
            className={classes['user-menu']}
            variant="outlined"
            endIcon={<Avatar alt={user.name} src={user.picture} sx={{width: 24, height: 24}} />}
            onClick={() => {
              dispatch(logout(window.location.origin));
              onClose();
            }}
          >
            {user.name}
          </Button>
        ) : (
          <Tooltip title="Log in">
            <Button
              className={classes.login}
              startIcon={<AccountIcon />}
              size="large"
              onClick={() => {
                dispatch(login(document.location.origin));
                onClose();
              }}
            >
              Log In
            </Button>
          </Tooltip>
        )}

        <Button startIcon={<CloseIcon />} className={classes.close} onClick={onClose}>
          Close Menu
        </Button>
      </div>
    </Modal>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;

  items: { label: string, target: string, icon?: React.ReactNode }[];
  user: UserType | undefined;
}

export default MobileNav;

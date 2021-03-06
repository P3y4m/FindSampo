import React, { Component } from 'react';
import intl from 'react-intl-universal';
import {
  MenuItem,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  Fab
} from '@material-ui/core';
import { connect } from 'react-redux';
import { setLocale } from '../actions/locale';


class LangMenu extends Component {
  state = {
    langManuOpen: false,
    selectedIndex: 0
  };

  langs = [
    intl.get('langMenu.abbreviation.english'),
    intl.get('langMenu.abbreviation.finnish'),
    intl.get('langMenu.abbreviation.swedish')
  ];

  onLangMenuOpenPressed = () => {
    this.setState(state => ({ langManuOpen: !state.langManuOpen }));
  };

  onLangMenuClosePressed = event => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ langManuOpen: false });
  };

  onMenuItemPressed = (e, index) => {
    this.props.setLocale(this.langs[index].toLowerCase());
    localStorage.setItem('locale', this.langs[index].toLowerCase());
    this.setState({ langManuOpen: false, selectedIndex: index });
  };

  render() {
    return (
      <div className="lang-menu">
        <Fab variant='round' size='small'
          aria-controls='lang-button'
          className="lang-menu__button"
          buttonRef={node => { this.anchorEl = node; }}
          aria-owns={this.state.langManuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={this.onLangMenuOpenPressed}
        >
          {localStorage.getItem('locale') || this.langs[this.state.selectedIndex]}
        </Fab>
        <Popper
          open={this.state.langManuOpen}
          anchorEl={this.anchorEl}
          transition disablePortal className="lang-menu__popper"
          placement="bottom"
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="menu-list-grow"
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.onLangMenuClosePressed}>
                  <MenuList>
                    {this.langs.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === this.state.selectedIndex}
                        onClick={event => this.onMenuItemPressed(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  setLocale: (locale) => dispatch(setLocale(locale))
});

export default connect(undefined, mapDispatchToProps)(LangMenu);
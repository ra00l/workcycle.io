import Avatar from 'material-ui/Avatar';
import {COLOR_ARRAY} from '../../contants/colors.constants';
import React from 'react';

function renderUserIcon(name, avatarImg) {
  const style = {
    fontSize: '16px',
  };

  if (avatarImg) {
    return (
      <div className="userAvatar">
        <Avatar size={34} src={avatarImg} style={style}/>
      </div>
    );
  }

  let firstLeters = '';
  if (name) {
    firstLeters = (name.match(/\b(\w)/g) || []).join('').toUpperCase();
  }

  const colorIdx = (firstLeters[0] || ' ').charCodeAt(0) % COLOR_ARRAY.length;
  style.backgroundColor = COLOR_ARRAY[colorIdx];

  return (
    <Avatar size={34} style={style}>{firstLeters}</Avatar>
  );
}

export {
  renderUserIcon,
};

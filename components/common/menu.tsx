import React, { useEffect } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import styles from '../../styles/MenuOptions.module.css';
type MyProps = {
  options?: string[];
  changeActiveFilter?: (e) => void;
  anchorElement: any;
  onClose?: () => void;
};
const MenuOptions = ({
  options = [],
  changeActiveFilter,
  anchorElement,
  onClose,
}: MyProps) => {
  useEffect(() => {
    setAnchorEl(anchorElement);
  }, [anchorElement]);
  const [anchorEl, setAnchorEl] = React.useState<null | Element>(anchorElement);
  const open = Boolean(anchorEl);
  const [activeFilter, setActiveFilter] = React.useState('');
  const handleClose = () => {
    setAnchorEl(null);

    onClose();
  };
  const handleItemClick = (item) => {
    if (item !== activeFilter) {
      setActiveFilter(item);

      changeActiveFilter(item);
    } else {
      setActiveFilter('');

      changeActiveFilter('');
    }
    handleClose();
  };
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      className={styles.menuWrapper}
    >
      {options.map((item) => (
        <MenuItem
          key={`menu__${item}`}
          value={item}
          onClick={() => {
            handleItemClick(item);
          }}
          className={`${
            activeFilter === item ? styles.selectedMenuItem : styles.menuItem
          }`}
        >
          {item}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default MenuOptions;

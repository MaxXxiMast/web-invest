import classes from './Navigation.module.css';

type Props = {
  activeClass?: boolean;
  handleOnClick?: () => void;
};

const MenuToggle = ({
  activeClass = false,
  handleOnClick = () => {},
}: Props) => {
  return (
    <div
      className={`${classes.MenuToggle} ${
        activeClass ? classes.ToggleMenu : ''
      }`}
      onClick={handleOnClick}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default MenuToggle;

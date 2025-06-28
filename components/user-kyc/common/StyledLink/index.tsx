import classes from './StyledLink.module.css';

type styledLinkProp = {
  title: string;
  onClick: () => void;
};

const StyledLink = ({ title = '', onClick = () => {} }: styledLinkProp) => {
  return (
    <div className={classes.linkContainer}>
      <span onClick={onClick} className={classes.styledLink}>
        {title}
      </span>
    </div>
  );
};

export default StyledLink;

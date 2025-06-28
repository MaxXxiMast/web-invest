import { useRouter } from 'next/router';
import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';
import Button from '../primitives/Button';

const classes: any = getObjectClassNames({
  actionButton: {
    [mediaQueries.desktop]: {
      minWidth: 180,
    },
    [mediaQueries.phone]: {
      width: '100% !important',
      height: 48,
      maxWidth: '150px !important',
    },
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    [mediaQueries.phone]: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      padding: ' 8px 16px 24px 16px',
      boxShadow: '0px -3px 8px rgb(0 0 0 / 8%)',
      background: 'var(--gripWhite)',
      zIndex: 20,
    },
    [mediaQueries.nonPhone]: {
      marginTop: 20,
    },
  },
  willDoLater: {
    fontWeight: 800,
    fontSize: 14,
    lineHeight: '24px',
    color: '#00357C',
    cursor: 'pointer',
    [mediaQueries.phone]: {
      width: '100%',
    },
  },
});

type ActionButtonProps = {
  active: boolean;
  data: any;
  onClick: () => void;
  redirectionURL?: string;
};

const ActionButton = (props: ActionButtonProps) => {
  const { active, data, onClick, redirectionURL = '/assets' } = props;

  const router = useRouter();

  return (
    <div className={classes.actionContainer}>
      <div
        className={classes.willDoLater}
        onClick={() => router.push(redirectionURL)}
      >
        {'Will do later'}
      </div>
      <Button
        onClick={() => active && onClick()}
        disabled={!active}
        className={classes.actionButton}
      >
        {data?.title}
        <span className="icon-caret-right" style={{ marginLeft: 8 }} />
      </Button>
    </div>
  );
};

export default ActionButton;

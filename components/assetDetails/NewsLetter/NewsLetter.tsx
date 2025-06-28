import { useRouter } from 'next/router';
import React from 'react';
import Button, { ButtonType } from '../../primitives/Button';
import classes from './NewsLetter.module.css';

const NewsLetter = () => {
  const router = useRouter();

  const handleLogin = () => {
    return router.push('/login');
  };

  return (
    <div className={classes.Newsletter}>
      <div className={`${classes.NewsLetterContainer} containerNew`}>
        <div className={classes.Wrapper}>
          <h3 className={classes.Title}>Start investing on Grip now</h3>
          <div className={classes.Form}>
            <Button
              onClick={handleLogin}
              variant={ButtonType.Secondary}
              className={classes.SubmitBtn}
            >
              Login
            </Button>
            <Button onClick={handleLogin} className={classes.SubmitBtn}>
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;

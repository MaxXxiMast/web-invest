import React, { useState } from 'react';
import Cookie from 'js-cookie';

import InputFieldSet from '../common/inputFieldSet';
import Button from '../primitives/Button';
import BackdropComponent from '../common/BackdropComponent';

import classes from '../../styles/Security.module.css';

type SecurityProps = {
  onChangeLoggedIn: (value: boolean) => void;
};

const Security = ({ onChangeLoggedIn }: SecurityProps) => {
  const [admin, setAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const changeAdmin = (event: any) => {
    const value = event.target.value;
    setAdmin(value);
  };

  const changePassword = (event: any) => {
    const value = event.target.value;
    setPassword(value);
  };

  const login = async () => {
    try {
      if (error) return;
      // Using fetch api because it is a nextjs client api route in which we
      // are calling the gripinvest api for masking the secret api url
      const response = await fetch('/api/security-login', {
        body: JSON.stringify({ admin, password }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Handle response
      if (!response.ok) {
        throw new Error(`An error occurred please try again`);
      }

      Cookie.set('devLoggedIn', 'true');
      onChangeLoggedIn(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <BackdropComponent open>
      <div className={classes.container}>
        <div className={classes.authBox}>
          <div className={classes.title}>GripInvest Admin</div>
          <div className={classes.inputFieldContainer}>
            <InputFieldSet
              value={admin}
              setError={setError}
              onChange={changeAdmin}
              type={'text'}
            />
            <InputFieldSet
              value={password}
              setError={setError}
              type="password"
              onChange={changePassword}
            />
          </div>
          <Button onClick={() => login()} disabled={error}>
            Login
          </Button>
        </div>
      </div>
    </BackdropComponent>
  );
};

export default Security;

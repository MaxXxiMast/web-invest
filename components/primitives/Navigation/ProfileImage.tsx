import React, { memo, useState } from 'react';
import Image from 'next/image';

// redux
import { useAppSelector } from '../../../redux/slices/hooks';

// css
import classes from './Navigation.module.css';

type Props = {
  size?: number;
  onclickEvent?: () => void;
};

const ProfileImage = ({ onclickEvent = () => {}, size = 32 }: Props) => {
  const { photo, firstName, lastName } = useAppSelector(
    (state) => state?.user?.userData
  );
  const [photoError, setPhotoError] = useState(false);

  const profilePhotoError = () => {
    setPhotoError(true);
  };

  return (
    <div
      className={`${classes.ProfilePic} flex_wrapper`}
      style={{ height: size, width: size }}
    >
      {photo && !photoError ? (
        <Image
          src={photo}
          alt={`${firstName} ${lastName}`}
          height={size}
          width={size}
          onError={profilePhotoError}
          onClick={onclickEvent}
          // loading="lazy"
          priority={true}
          layout="fixed"
          blurDataURL="./profile-placeholder.svg"
          placeholder="blur"
        />
      ) : (
        <div className="flex_wrapper" onClick={onclickEvent}>
          {firstName?.charAt(0).toUpperCase()}
          {lastName?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default memo(ProfileImage);

import Button, { ButtonType } from '../../../../primitives/Button';
import { GRIP_INVEST_BUCKET_URL } from '../../../../../utils/string';
import styles from './FDCompletedUI.module.css';
import Image from '../../../../primitives/Image';

type ButtonConfig = {
  label: string;
  onClick: () => void;
  variant?: ButtonType;
};

type FDCompletedUIProps = {
  content: {
    heading: string;
    subHeading?: string;
  };
  image?: {
    src: string;
    alt: string;
  };
  buttons: ButtonConfig[];
  children?: React.ReactNode;
  showHeaderIcon?: boolean;
};

export default function FDCompletedUI({
  content,
  image,
  buttons,
  children,
  showHeaderIcon,
}: FDCompletedUIProps) {
  return (
    <div className={`flex-column ${styles.BodyContainer}`}>
      <div className={`flex-column`}>
        <span className={styles.Heading}>{content.heading}</span>
        {showHeaderIcon ? (
          <span className={styles.ArrowIcon}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/VerticalArrow.svg`}
              alt="arrow"
              width={60}
              height={60}
              layout={'fixed'}
            />
          </span>
        ) : null}
      </div>

      {image?.src ? (
        // NextJS Component not able to handle height and width prooperly
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.alt}
          src={`${GRIP_INVEST_BUCKET_URL}${image.src}`}
          alt={image.alt}
          width={'100%'}
          height={112}
        />
      ) : null}
      {children}
      <span className={`${styles.SubHeading} ${styles.SubHeadingDesktop}`}>
        {content.subHeading}
      </span>
      <div className={`flex justify-between ${styles.ButtonContainer}`}>
        {buttons.map((buttonData) => {
          return (
            <Button
              key={`${buttonData.label}`}
              variant={buttonData?.variant || ButtonType.Primary}
              onClick={buttonData.onClick}
              width={'100%'}
            >
              {buttonData.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

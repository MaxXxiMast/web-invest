import Button, { ButtonType } from '../../../primitives/Button';
import styles from './FilterCardUI.module.css';

type FilterCardButton = {
  label: string;
  onClick: () => void;
  variant?: ButtonType;
};

type FilterCardUIProps = {
  heading: string;
  subHeading: string;
  buttons: FilterCardButton[];
};

export default function FilterCardUI({
  heading,
  subHeading,
  buttons,
}: FilterCardUIProps) {
  return (
    <div className={`items-align-center-column-wise ${styles.Container}`}>
      <div className={styles.Heading}>{heading}</div>
      <div className={styles.SubHeading}>{subHeading}</div>
      <div className={`flex ${styles.ButtonContainer}`}>
        {buttons.map((button) => (
          <Button
            key={button.label}
            width={'100%'}
            onClick={button.onClick}
            variant={button?.variant || ButtonType.Primary}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

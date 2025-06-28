import dynamic from 'next/dynamic';
import classes from './ValueFields.module.css';

const TooltipCompoent = dynamic(
  () => import('../../primitives/TooltipCompoent/TooltipCompoent'),
  {
    ssr: false,
  }
);

type Props = {
  label: string;
  value: string | any;
  textCapitalize?: boolean;
};

const ValueFields = ({ label, value, textCapitalize = true }: Props) => {
  if (!label && !value) {
    return null;
  }

  const strippedStr = () => {
    if (
      label !== 'Address' &&
      typeof value === 'string' &&
      value?.length > 40
    ) {
      const strippedString = `${value?.slice(0, 30)}...${value?.slice(-5)}`;
      return (
        <TooltipCompoent toolTipText={value}>
          <p>{strippedString}</p>
        </TooltipCompoent>
      );
    } else {
      return <p>{value}</p>;
    }
  };

  return (
    <div
      className={`${classes.StaticField} ${
        textCapitalize ? classes.textCapitalize : ''
      }`}
    >
      {label && <label>{label}</label>}
      {value && strippedStr()}
    </div>
  );
};

export default ValueFields;

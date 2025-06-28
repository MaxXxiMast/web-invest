import classes from './TenureInMonthsAndYears.module.css';

type MyProps = {
  value: any;
  valueClassName?: any;
  suffixClassName?: any;
};

function TenureInMonthsAndYrs(props: MyProps) {
  const { value } = props;
  return (
    <div className={`${(classes.value, props?.valueClassName)}`}>
      {value?.yearsValue ? (
        <>
          {value?.yearsValue}
          <span className={`${(classes.subValue, props?.suffixClassName)}`}>
            {value?.yearsSuffix}
          </span>
        </>
      ) : null}{' '}
      {value?.monthsValue ? (
        <>
          {value?.monthsValue}
          <span className={`${(classes.subValue, props?.suffixClassName)}`}>
            {value?.monthsSuffix}
          </span>
        </>
      ) : null}
    </div>
  );
}
export default TenureInMonthsAndYrs;

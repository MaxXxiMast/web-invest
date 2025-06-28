// NODE MODULES
import { useEffect } from 'react';

// Components
import Financial from '../financial';
import Identity from '../identity';
import Nominee from '../nominee/nomineeRouter';
import OtherInfo from '../other-info';

// Context
import { useKycContext } from '../../../contexts/kycContext';
import { handleExtraProps } from '../../../utils/string';

// Styles
import classes from './Layout.module.css';

// Kyc steps will render based on active step
type LayoutBodyProps = {
  className?: string;
};

const LayoutBody = ({ className = '' }: LayoutBodyProps) => {
  const { kycActiveStep } = useKycContext();

  // This will reset footer click on every step change
  useEffect(() => {
    setTimeout(() => {
      window.scroll(0, 0);
    }, 100);
  }, [kycActiveStep]);

  const renderComponet = () => {
    switch (kycActiveStep) {
      case 0:
        return <Identity />;
      case 1:
        return <Financial />;
      case 2:
        return <OtherInfo />;
      case 3:
        return <Nominee />;
      default:
        return <Identity />;
    }
  };

  return (
    <div
      className={`flex-column ${classes.Body} ${handleExtraProps(className)}`}
    >
      {renderComponet()}
    </div>
  );
};

export default LayoutBody;

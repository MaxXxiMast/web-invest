import { createContext, useContext, useState } from 'react';
import { KycStepModel } from '../components/user-kyc/utils/models';
import { completedStepsHelper } from '../components/user-kyc/utils/helper';

const KycContext = createContext({});

type StateProps = {
  activeStep: number;
  isMobile: boolean;
  [key: string]: unknown;
};

export function KycContextProvider({
  children,
  aadhaarXMLFlowCheck,
  ifscConfig,
}) {
  const [completedKycSteps, setCompletedKycSteps] = useState<KycStepModel[]>(
    []
  );
  const [kycValues, setKycValues] = useState<Partial<StateProps>>({});
  const [kycActiveStep, setKycActiveStep] = useState(0);

  const handleKycActiveStep = (val: number) => {
    setKycActiveStep(val);
  };

  // Function to update or add values to the context
  const updateKycContextValue = (updatedObject: any) => {
    setKycValues((prevValues) => ({
      ...prevValues,
      ...updatedObject,
    }));
  };

  const updateCompletedKycSteps = (val: KycStepModel | KycStepModel[]) => {
    let newArr: KycStepModel[] = [...completedKycSteps];
    let newVal = Array.isArray(val) ? val : [val];

    for (const data of newVal) {
      newArr = completedStepsHelper(newArr, data);
    }

    // To Handle Footer Click issue when component changes
    setTimeout(() => {
      setCompletedKycSteps(newArr);
    }, 100);
  };

  // Create the context value
  const contextValue = {
    kycValues,
    completedKycSteps,
    kycActiveStep,
    aadhaarXMLFlowCheck,
    ifscConfig,
    updateKycContextValue,
    updateCompletedKycSteps,
    handleKycActiveStep,
  };

  return (
    <KycContext.Provider value={contextValue}>{children}</KycContext.Provider>
  );
}

type Props = {
  kycValues: Partial<StateProps>;
  completedKycSteps: KycStepModel[];
  kycActiveStep: number;
  aadhaarXMLFlowCheck: boolean;
  ifscConfig: any;
  updateKycContextValue: (newData: any) => void;
  updateCompletedKycSteps: (val: KycStepModel | KycStepModel[]) => void;
  handleKycActiveStep: (val: number) => void;
};

// Custom hook to access the context
export function useKycContext(): Partial<Props> {
  return useContext(KycContext);
}

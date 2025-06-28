import { useDispatch } from 'react-redux';
import { useEffect, useCallback, useRef, useState } from 'react'; // Add useCallback and useRef

// REDUX
import { useAppSelector } from '../../../redux/slices/hooks';
import { setMfData } from '../redux/mf';

// COMPONENTS
import MfCalculatorInputField from '../mf-calculator-input-field/MfCalculatorInputField';

// UTILS
import { numberToCurrency } from '../../../utils/number';
import { getAllPaymentMethods, getPaymentMethod } from '../utils/helpers';
import { debounce } from '../../../utils/timer';

// API
import { getPaymentMethodsMf } from '../../../api/mf';

// STYLES
import styles from './MfInputFieldWrapper.module.css';

const MfInputFieldWrapper = () => {
  const dispatch = useDispatch();
  const [isUserInteract, setIsUserInteract] = useState(false);
  const {
    inputValue = 50000,
    allowedMinInputValue,
    allowedMaxInputValue,
    multiplier = 50000,
    assetId,
  } = useAppSelector((state) => (state as any)?.mfConfig ?? {});

  // Memoize fetchPaymentMethods using useCallback
  const fetchPaymentMethods = useCallback(
    async (amount: number) => {
      dispatch(
        setMfData({
          isPaymentMethodsLoading: true,
        })
      );
      const paymentMethods = await getPaymentMethodsMf({
        amount: Number(amount),
        assetID: assetId,
      });
      const paymentMethod = getPaymentMethod(paymentMethods);
      const availablePaymentMethods = getAllPaymentMethods(paymentMethods);
      dispatch(
        setMfData({
          availablePaymentMethods,
          selectedPaymentMethod: paymentMethod,
          isPaymentMethodsLoading: false,
        })
      );
    },
    [assetId, dispatch]
  );

  // Memoize the debounced function using useRef and useCallback
  const debouncedFetchPaymentMethodsRef = useRef(
    debounce(fetchPaymentMethods, 500)
  );

  useEffect(() => {
    // Update the debounced function if fetchPaymentMethods changes
    debouncedFetchPaymentMethodsRef.current = debounce(
      fetchPaymentMethods,
      500
    );
  }, [fetchPaymentMethods]);

  const handleInputChange = async (target: HTMLInputElement) => {
    const value = target.value.replace(/\D/g, '');
    const amount = Number(value);
    dispatch(
      setMfData({
        inputValue: Number(amount),
      })
    );
  };

  useEffect(() => {
    setIsUserInteract(true);
    // Call the debounced function only if the input is valid and user interacted
    if (!isUserInteract) {
      return;
    }

    const showValErr =
      Number(inputValue) > allowedMaxInputValue ||
      Number(inputValue) < allowedMinInputValue ||
      Number(inputValue) % multiplier !== 0;

    dispatch(
      setMfData({
        isCalculatorBtnDisabled: showValErr,
      })
    );

    if (!showValErr) {
      // Call the debounced function
      debouncedFetchPaymentMethodsRef.current(inputValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const renderValidationError = () => {
    const amount = Number(inputValue);
    if (amount % multiplier !== 0) {
      return (
        <p className={`text-center ${styles.ValueErr}`}>
          Amount must multiple of ₹{numberToCurrency(multiplier)}
        </p>
      );
    }
    if (amount > allowedMaxInputValue || amount < allowedMinInputValue) {
      return (
        <p className={`text-center ${styles.ValueErr}`}>
          Amount must be between ₹{numberToCurrency(allowedMinInputValue)} and ₹
          {numberToCurrency(allowedMaxInputValue)}
        </p>
      );
    }
    return null;
  };

  return (
    <div className={`flex-column ${styles.InputWrapper}`}>
      <MfCalculatorInputField
        inputValue={inputValue}
        handleInputChange={handleInputChange}
      />
      {renderValidationError()}
    </div>
  );
};

export default MfInputFieldWrapper;

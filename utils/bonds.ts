import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(isBetween);

dayjs.tz.setDefault('Asia/Kolkata');

export const isWeekend = (date: string) => {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
};

export const BONDS = 'Bonds';
export const BONDS_TOOLTIPS = {
  PRICE_PER_UNIT_BONDS: 'Cost of buying of one lot of a security.',
  INVESTMENT_AMOUNT_BONDS: 'Purchase price * Number of units',
  PRE_TAX_RETURNS_BONDS:
    "The returns shown are prior to TDS and subject to the investor's marginal tax rate. Interest earned is subjected to a 10% TDS deduction. YTM is calculated on T+1 day for SEBI-regulated Bonds/SDIs and T+2 for RBI-regulated SDIs where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).",
  CALCULATOR_NOTE_BONDS:
    'Available for users having demat account with either <strong>NSDL</strong> or <strong>CDSL</strong>',
  MLD_PRE_TAX_RETURNS_BONDS: 'MLD_PRE_TAX_RETURNS_BONDS',
  MLD_INVESTMENT_AMOUNT_BONDS: 'MLD_INVESTMENT_AMOUNT_BONDS',
  MLD_DISCOUNTED_PRICE:
    'Present value of the future cash flows using Yield To Maturity (YTM) as the discount rate.',
  MLD_REDEMPTION_PRICE:
    'Amount that will be paid by the Issuer at the pre-decided maturity date.',
  YTM: `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`,
  AMOUNT_PAYABLE: 'Purchase Amount +  Accrued Interest + Stamp Duty',
  PRINCIPAL_AMOUNT: `Principal is the amount that the issuer has borrowed and will repay at the time of maturity. \n
  Principal amount= (Face value of the bond)*(Number of bonds)`,
};

export const checkInvestmentDateExistsInHolidays = (
  holidays: any,
  investmentDate: string
) => {
  return holidays.find((a: any) =>
    dayjs(a?.date).isSame(investmentDate, 'date')
  );
};

export const getAccruedInterest = (
  investmentDate: string,
  bondDetails: any,
  lotSize: number,
  noOfDays: number = 0
) => {
  //timezone change required, not think so
  const rate =
    (bondDetails?.couponRate /
      (dayjs().endOf('year').diff(dayjs().startOf('year'), 'days') + 1)) *
    0.01;
  const diffInDate = noOfDays;

  return rate * diffInDate * Number(bondDetails?.faceValue) * Number(lotSize);
};

export const getInvestmentDate = (holidays: any, date?: any) => {
  let investmenDate = dayjs(date).tz().add(1, 'day').format();
  for (let i = 0; i < 2; i++) {
    if (i !== 0) {
      investmenDate = dayjs(investmenDate).tz().add(1, 'day').format();
    }

    while (
      checkInvestmentDateExistsInHolidays(holidays, investmenDate) ||
      isWeekend(investmenDate)
    ) {
      investmenDate = dayjs(investmenDate).tz().add(1, 'day').format();
    }
  }
  return investmenDate;
};

export const calculateBondValues = (
  bondDetails: any,
  holidays: any,
  lotSize: number,
  date?: any,
  isMld?: boolean
) => {
  if (!bondDetails) return;

  let couponFrequency = bondDetails?.couponInterestReturnFrequency;
  if (isMld) {
    couponFrequency = 'MLD';
  }
  return calculateBondValuesMapping[couponFrequency]?.accrued(
    bondDetails,
    holidays,
    lotSize,
    date
  );
};

export const calculateBondValuesDefault = (
  bondDetails: any,
  holidays: any,
  lotSize: number,
  date?: any
) => {
  if (!bondDetails) return;

  return {
    investmentAmount: bondDetails?.investmentAmount * lotSize,
    stampDuty: bondDetails?.stampDuty * lotSize,
    purchasePrice: bondDetails?.purchasePrice * lotSize,
    accruedInterest: bondDetails?.accruedInterest * lotSize,
    principalAmount: bondDetails?.principalAmount * lotSize,
    totalInterest: bondDetails?.totalInterest * lotSize,
    shouldAddInterest: Number(bondDetails?.accruedInterest) >= 0,
  };
};

const calculateBondValuesMld = (
  bondDetails: any,
  holidays: any,
  lotSize: number,
  date?: any
) => {
  const discountedPrice =
    Number(bondDetails?.discountedPrice) * Number(lotSize);
  const stampDuty = (discountedPrice * 0.0001) / 100;
  return {
    discountedPrice,
    investmentAmount: discountedPrice + stampDuty,
    preTaxAmount: lotSize * bondDetails?.redemptionValue,
    redemptionPrice: bondDetails?.redemptionValue,
    stampDuty,
  };
};

const checkHoliday = (date: string, holidays: any) => {
  // check holidays and decide date
  while (
    checkInvestmentDateExistsInHolidays(holidays, date) ||
    isWeekend(date)
  ) {
    date = dayjs(date).tz().add(1, 'day').format();
  }
  return date;
};

const getMaturityDate = (bondDetails: any, holidays: any) => {
  const date = dayjs(bondDetails.maturityDate).tz().format();
  return checkHoliday(date, holidays);
};

const calculateYtmTillMaturityDate = (
  investmentDate: string,
  bondDetails: any,
  holidays: any
) => {
  const mD = dayjs(getMaturityDate(bondDetails, holidays))
    .tz()
    .format('YYYY-MM-DD');
  const noOfDays = dayjs(mD).diff(
    dayjs(investmentDate).tz().format('YYYY-MM-DD'),
    'days'
  );
  return Math.pow(1 + bondDetails.preTaxYtm / 100, noOfDays / 365);
};

export const calculateDiscountedPrice = (
  investmentDate: string,
  bondDetails: any,
  holidays: any
) => {
  const ytmForTenure = calculateYtmTillMaturityDate(
    investmentDate,
    bondDetails,
    holidays
  );
  return bondDetails.redemptionValue / ytmForTenure;
};

const getPayoutDatesForQuarterlyFrequency = (
  investmentDate: string,
  holidays: any,
  date: string
) => {
  let dates: any[] = [];
  date = dayjs(date).tz().format('YYYY-MM-DD');
  while (dayjs(date).isAfter(investmentDate)) {
    let noHolidayDate = date;
    while (
      checkInvestmentDateExistsInHolidays(holidays, noHolidayDate) ||
      isWeekend(noHolidayDate)
    ) {
      noHolidayDate = dayjs(noHolidayDate)
        .tz()
        .add(1, 'day')
        .format('YYYY-MM-DD');
    }
    dates.push(noHolidayDate);
    date = dayjs(date).tz().subtract(3, 'months').format('YYYY-MM-DD');
  }
  dates = dates.sort((a: any, b: any) => dayjs(a).diff(b));
  return dates;
};

const getLastAndNextPaymentDateForQuaterlyFrequency = (
  bondDetails: any,
  holidays: any,
  investmentDate: string
) => {
  let { maturityDate } = bondDetails;
  const dates = getPayoutDatesForQuarterlyFrequency(
    investmentDate,
    holidays,
    maturityDate
  );

  let lastPaymentDate = dayjs(dates[0])
    .tz()
    .subtract(3, 'months')
    .format('YYYY-MM-DD');
  while (
    isWeekend(lastPaymentDate) ||
    checkInvestmentDateExistsInHolidays(holidays, lastPaymentDate)
  ) {
    lastPaymentDate = dayjs(lastPaymentDate)
      .tz()
      .add(1, 'day')
      .format('YYYY-MM-DD');
  }

  return {
    nextPaymentDate: dates[0],
    nextToNextPaymentDate: dates[1],
    lastPaymentDate,
  };
};

export const calculateBondValuesQuaterly = (
  bondDetails: any,
  holidays: any,
  lotSize: number,
  date?: any
) => {
  return {
    investmentAmount: bondDetails?.investmentAmount * lotSize,
    stampDuty: bondDetails?.stampDuty * lotSize,
    purchasePrice: bondDetails?.purchasePrice * lotSize,
    accruedInterest: bondDetails?.accruedInterest * lotSize,
    principalAmount: bondDetails?.principalAmount * lotSize,
    totalInterest: bondDetails?.totalInterest * lotSize,
    shouldAddInterest: Number(bondDetails?.accruedInterest) >= 0,
  };
};

const frequencyMapping = {
  Monthly: 12,
  Quarterly: 3,
  'Semi Annually': 2,
  Annually: 1,
  'At Maturity': 0,
};

const getBondFrequency = (bondDetails: any) => {
  const principalFrequency = bondDetails?.couponPrincialPaymentFrequency;
  const couponFrequency = bondDetails?.couponInterestReturnFrequency;
  return Math.max(
    frequencyMapping[principalFrequency],
    frequencyMapping[couponFrequency]
  );
};

export const calculateBondsReturnData = (
  bondDetails: any = {},
  holidays: any,
  lotSize: number,
  date?: any,
  isMld?: boolean
) => {
  let couponFrequency = bondDetails?.couponInterestReturnFrequency;
  if (isMld) {
    couponFrequency = 'MLD';
  }
  return calculateBondValuesMapping[couponFrequency]?.returns(
    bondDetails,
    holidays,
    lotSize,
    date
  );
};

const calculateBondsReturnDataDefault = (
  bondDetails: any = {},
  holidays: any,
  lotSize: number,
  date?: any
) => {
  const {
    principalAmount,
    totalInterest,
    investmenDate,
    shouldAddInterest,
    paymentDate: calculatedPaymentDate,
  } = calculateBondValues(bondDetails, holidays, lotSize, date);

  const freq = getBondFrequency(bondDetails);
  const { maturityDate } = bondDetails;
  let schedule: any[] = [];

  const principalFrequency =
    frequencyMapping[bondDetails?.couponPrincialPaymentFrequency];
  const interestFrequency =
    frequencyMapping[bondDetails?.couponInterestReturnFrequency];

  let currentMonth = dayjs(date).tz().format('MMM YYYY');
  const lastDay = dayjs(date).endOf('month').get('date');
  const payOutDate = dayjs(bondDetails?.maturityDate).get('date');

  let modifiedDate =
    Number(payOutDate) <= 9 ? `0${Number(payOutDate)}` : Number(payOutDate);

  if (Number(modifiedDate) > lastDay) {
    modifiedDate = lastDay;
  }
  let couponDate = `${modifiedDate} ${currentMonth}`;
  const lastDayNextMonth = dayjs(date)
    .add(1, 'month')
    .endOf('month')
    .get('date');
  let nextMonthModifiedDate =
    Number(payOutDate) <= 9 ? `0${Number(payOutDate)}` : Number(payOutDate);

  if (Number(nextMonthModifiedDate) > lastDayNextMonth) {
    nextMonthModifiedDate = lastDayNextMonth;
  }

  if (shouldAddInterest) {
    if (dayjs(investmenDate).isAfter(dayjs(couponDate, 'DD MMM YYYY'))) {
      couponDate = `${nextMonthModifiedDate} ${dayjs(date)
        .tz()
        .add(1, 'month')
        .format('MMM YYYY')}`;
    }
  } else {
    let month = 2;
    const paymentDate = dayjs(calculatedPaymentDate, 'DD MMM YYYY')
      .tz()
      .format('YYYY-MM-DD');
    const investDate = dayjs(investmenDate).tz().format('YYYY-MM-DD');

    if (!dayjs(investDate).isBefore(paymentDate)) {
      month = 1;
    }
    const lastDayNextToNextMonth = dayjs(date)
      .tz()
      .add(month, 'month')
      .endOf('month')
      .get('date');
    let nextToNextMonthModifiedDate =
      Number(payOutDate) <= 9 ? `0${Number(payOutDate)}` : Number(payOutDate);

    if (Number(nextToNextMonthModifiedDate) > lastDayNextToNextMonth) {
      nextToNextMonthModifiedDate = lastDayNextToNextMonth;
    }
    couponDate = `${nextToNextMonthModifiedDate} ${dayjs(date)
      .tz()
      .add(month, 'month')
      .format('MMM YYYY')}`;
  }

  let lastCouponDate = dayjs(couponDate, 'DD MMM YYYY')
    .subtract(1, 'month')
    .format('DD MMM YYYY');
  const duration =
    dayjs(maturityDate).tz().diff(dayjs(couponDate, 'DD MMM YYYY'), 'months') +
    1;

  if (freq === 0) {
    return [
      {
        date: dayjs(maturityDate).tz().format('DD MMM YYYY'),
        principalAmount,
        interest: totalInterest,
      },
    ];
  }

  for (let i = 0; i < duration; i++) {
    let date = dayjs(couponDate, 'DD MMM YYYY').format();
    while (
      checkInvestmentDateExistsInHolidays(holidays, date) ||
      isWeekend(date)
    ) {
      date = dayjs(date).tz().add(1, 'day').format();
    }
    schedule.push({
      date: dayjs(date).tz().format('DD MMM YYYY'),
      principalAmount:
        principalFrequency === frequencyMapping.Monthly
          ? principalAmount / duration
          : principalFrequency === frequencyMapping['At Maturity'] &&
            i === duration - 1
          ? principalAmount
          : 0,
      interest:
        interestFrequency === frequencyMapping.Monthly
          ? getAccruedInterest(
              investmenDate,
              bondDetails,
              lotSize,
              dayjs(couponDate).diff(dayjs(lastCouponDate), 'days')
            )
          : interestFrequency === frequencyMapping['At Maturity'] &&
            i === duration - 1
          ? totalInterest
          : 0,
    });

    if (freq === frequencyMapping.Monthly) {
      lastCouponDate = couponDate;
      const nextMonthAndYear = dayjs(couponDate, 'DD MMM YYYY')
        .add(1, 'month')
        .format('MMM YYYY');
      let nextMonthDate = `${modifiedDate} ${nextMonthAndYear}`;
      const lastDay = dayjs(couponDate, 'DD MMM YYYY')
        .add(1, 'month')
        .endOf('month')
        .get('date');

      if (Number(modifiedDate) > lastDay) {
        nextMonthDate = `${lastDay} ${nextMonthAndYear}`;
      }
      couponDate = nextMonthDate;
    }
  }

  return schedule;
};

const calculateBondsReturnDataQuaterly = (
  bondDetails: any = {},
  holidays: any,
  lotSize: number,
  date?: any
) => {
  const { principalAmount, investmenDate, shouldAddInterest, paymentDate } =
    calculateBondValues(bondDetails, holidays, lotSize, date);
  const investDate = dayjs(investmenDate).tz().format('YYYY-MM-DD');
  const dates = getPayoutDatesForQuarterlyFrequency(
    investDate,
    holidays,
    dayjs(bondDetails?.maturityDate).tz().format('YYYY-MM-DD')
  );
  const nextPaymentDateIndex = dates.indexOf(paymentDate);

  const { nextPaymentDate, lastPaymentDate } =
    getLastAndNextPaymentDateForQuaterlyFrequency(
      bondDetails,
      holidays,
      investDate
    );

  const principalFrequency =
    frequencyMapping[bondDetails?.couponPrincialPaymentFrequency];
  let schedule: any[] = [];
  let payoutDate = dates[nextPaymentDateIndex];
  let lastPayoutDate = shouldAddInterest ? lastPaymentDate : nextPaymentDate;
  for (let i = nextPaymentDateIndex; i < dates.length; i++) {
    const data = {
      date: dayjs(dates[i]).tz().format('DD MMM YYYY'),
      principalAmount:
        principalFrequency === frequencyMapping.Monthly
          ? principalAmount / dates.length
          : principalFrequency === frequencyMapping['At Maturity'] &&
            i === dates.length - 1
          ? principalAmount
          : 0,
      interest: getAccruedInterest(
        investmenDate,
        bondDetails,
        lotSize,
        dayjs(payoutDate).diff(dayjs(lastPayoutDate), 'days')
      ),
    };
    schedule.push(data);
    lastPayoutDate = payoutDate;
    payoutDate = dayjs(payoutDate).tz().add(3, 'months').format('YYYY-MM-DD');
  }
  return schedule;
};

const calculateBondsReturnDataMld = (
  bondDetails: any = {},
  holidays: any,
  lotSize: number,
  date?: any
) => {
  const investmentDate = getInvestmentDate(holidays, date);
  const maturityDate = getMaturityDate(bondDetails, holidays);
  const discountedPrice = calculateDiscountedPrice(
    investmentDate,
    bondDetails,
    holidays
  );
  const principalAmount = lotSize * discountedPrice;
  const preTaxReturns = lotSize * Number(bondDetails?.redemptionValue);
  return [
    {
      date: dayjs(maturityDate).tz().format('DD MMM YYYY'),
      principalAmount,
      interest: preTaxReturns - principalAmount,
    },
  ];
};

export const getBondReturnSchedule = (
  txns: any,
  bondDetails: any,
  holidays: [],
  returnStatus: {},
  isMld = false
) => {
  let finalAmount = {};
  txns?.forEach((singleTransaction, index) => {
    let calculateBondsReturnDataResult = calculateBondsReturnData(
      bondDetails,
      holidays,
      singleTransaction.units,
      singleTransaction?.orderDate,
      isMld
    );
    calculateBondsReturnDataResult?.forEach((data) => {
      let tempData = finalAmount[data?.date]?.amt || 0;
      tempData =
        tempData +
        data?.principalAmount +
        Number(Number(data?.interest).toFixed(2));
      finalAmount[data?.date] = {
        amt: tempData,
      };
      finalAmount[data?.date].status = returnStatus[data?.date] ?? 'scheduled';
    });
  });
  return finalAmount;
};

const calculateBondValuesMapping = {
  Monthly: {
    accrued: calculateBondValuesDefault,
    returns: calculateBondsReturnDataDefault,
  },
  Quarterly: {
    accrued: calculateBondValuesQuaterly,
    returns: calculateBondsReturnDataQuaterly,
  },
  'Semi Annually': {
    accrued: calculateBondValuesDefault,
    returns: calculateBondsReturnDataDefault,
  },
  Annually: {
    accrued: calculateBondValuesDefault,
    returns: calculateBondsReturnDataDefault,
  },
  'At Maturity': {
    accrued: calculateBondValuesDefault,
    returns: calculateBondsReturnDataDefault,
  },
  MLD: {
    accrued: calculateBondValuesMld,
    returns: calculateBondsReturnDataMld,
  },
};

export const bondOrderStatus = {
  1: {
    statusText: 'Confirmed',
    infoTitle: 'Please check your Demat account',
    style: {
      color: '#02C988',
      borderColor: '#02C988',
    },
  },
  7: {
    statusText: 'Initiated',
    infoTitle: 'Your payment is successful',
    infoText:
      'Transfer of securities will take place after verification of your submitted documents.',
    style: {
      color: '#00357C',
      borderColor: '#00357C',
    },
  },
  8: {
    statusText: 'Accepted',
    infoTitle: 'Your securities will be transferred soon',
    infoText:
      'We will initiate the transfer of securities to your DEMAT account soon.',
    style: {
      color: '#02C988',
      borderColor: '#02C988',
    },
  },
};

export type BondsCalcultionDataModal = {
  investmentAmount: number;
  stampDuty: number;
  purchasePrice: number;
  accruedInterest: number;
  principalAmount: number;
  totalInterest: number;
  maxInvestment: number;
  maxLots: number;
  minLots: number;
  totalAdditionalCharges: number;
};

export type BondsMldCalcultionDataModal = {
  discountedPrice: number;
  investmentAmount: number;
  preTaxAmount: number;
  preTaxReturns: number;
  redemptionPrice: number;
  stampDuty: number;
  maxInvestment: number;
  maxLots: number;
  minLots: number;
};

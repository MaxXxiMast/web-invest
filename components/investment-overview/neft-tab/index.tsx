import { useContext } from 'react';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import {
  InvestmentTabProps,
  NeftBankDetails,
  NeftSteps,
  giveInstructionList,
} from '../../../utils/investment';
import AccountInfo from '../account-info';
import CopyToClipboardWidget from '../../primitives/CopyToClipboard';
import Image from '../../primitives/Image';
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';
import classes from './NeftTab.module.css';
import Accordian from '../../primitives/Accordian';
import { getPaymentOptionMessages } from '../../../utils/kyc';

const getNeftStepsText = (val: string[]) => {
  let joinStr = '';
  val.forEach((ele) => {
    joinStr = joinStr.concat(`- ${ele}\n`);
  });
  return joinStr.trim();
};

const RenderAccountInfo = ({
  userKycDetails,
  paymentAcceptanceCriteria = '',
}) => {
  return (
    <AccountInfo
      showCardTitle={false}
      bankAccNumber={userKycDetails?.accountNo}
      bankName={userKycDetails?.bankName}
      className={`${classes.InfoCard}`}
    >
      <p className={`${classes.Txt} ${classes.Mt12}`}>
        {paymentAcceptanceCriteria}
      </p>
    </AccountInfo>
  );
};

const RenderBankDetailValue = (props) => {
  const { id, value } = props;
  if (id === 'accountNo') {
    return (
      <>
        <span className={classes.BankData}>{value?.slice(0, 6)}</span>
        <span className={`${classes.BankData} ${classes.Bold}`}>
          {value?.slice(6)}
        </span>
      </>
    );
  }
  return <span className={classes.BankData}>{value}</span>;
};

export const RenderBankDetails = (props) => {
  const { neftDetails } = props;
  const dataToCopy: string = `You'll need to make the payment to following bank account after placing the order\n
  Beneficiary Name: ${neftDetails?.beneficiaryName ?? ''}
  Account Number: ${neftDetails?.accountNo ?? ''}
  IFSC Code: ${neftDetails?.ifscCode ?? ''}
  Account Type: ${
    neftDetails?.accountType?.charAt(0)?.toUpperCase() +
      neftDetails?.accountType?.slice(1) || ''
  }
  Bank Name: ${neftDetails?.bankName ?? ''}\n\n${getNeftStepsText(NeftSteps)}`;

  return (
    <div className={`${classes.CardTop} flex direction-column`}>
      <div className={`${classes.Left} flex direction-column`}>
        <ul className={`${classes.BankList} flex direction-column`}>
          {NeftBankDetails.map((ele, index) => {
            const { id, label } = ele || {};
            let value = neftDetails?.[id] ?? '';
            if (id === 'accountType') {
              value = value?.charAt(0)?.toUpperCase() + value?.slice(1) || '';
            }
            return (
              <li className="flex" key={`${id}`}>
                <span className="flex-one">{label}</span>
                <RenderBankDetailValue id={id} value={value} />
                <CopyToClipboardWidget text={value} />
              </li>
            );
          })}
        </ul>
      </div>
      <div className={classes.Center}>
        <CopyToClipboardWidget
          text={dataToCopy.trim()}
          widgetLabel="Copy Beneficiary Details"
          iconAfterText
        />
      </div>
    </div>
  );
};

export const RenderInstructionTxt = () => {
  return (
    <div className={`items-align-center-row-wise ${classes.InstructionLine}`}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/AnnouncementSpeaker.svg`}
        alt="Announcement"
        width={12}
        height={12}
        layout="fixed"
      />
      <p className={classes.InstructionTxt}>
        Follow these instructions to ensure a smooth transfer
      </p>
    </div>
  );
};

const AccordianBankDetails = (props) => {
  return (
    <div className={classes.BankDetails}>
      {
        <Accordian
          title="Pay to Account"
          defaultValue={false}
          titleClassName={classes.BankTitle}
        >
          <RenderBankDetails neftDetails={props?.neftDetails} />
        </Accordian>
      }
    </div>
  );
};

export const RenderInstructions = (props) => {
  return (
    <ol className={`flex-column ${classes.InstructionList}`}>
      {giveInstructionList({
        settlementDate: props?.settlementDate,
        totalPayableAmount: props?.totalPayableAmount,
      }).map((item, index) => {
        return (
          <li className={classes.InstructionListRow} key={`${item?.title}`}>
            <Accordian
              title={item.title}
              defaultValue={false}
              titleClassName={classes.title}
            >
              <p className={classes.description}>{item.description}</p>
            </Accordian>
          </li>
        );
      })}
    </ol>
  );
};

const NeftTab = ({
  className = '',
  totalPayableAmount,
}: InvestmentTabProps) => {
  const { neftDetails, bankDetails, pageData }: any = useContext(
    InvestmentOverviewContext
  );

  const paymentOptionMessages = getPaymentOptionMessages(pageData);

  return (
    <div
      className={`flex direction-column ${classes.Wrapper}  ${handleExtraProps(
        className
      )}`}
      id="NeftTab"
    >
      <div className={classes.Details}>
        <RenderAccountInfo
          userKycDetails={bankDetails}
          paymentAcceptanceCriteria={
            paymentOptionMessages?.paymentAcceptanceCriteria
          }
        />
        <AccordianBankDetails neftDetails={neftDetails} />
        <RenderInstructionTxt />
        <div className={classes.Instructions}>
          <RenderInstructions
            settlementDate={neftDetails?.settlementDate}
            totalPayableAmount={totalPayableAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default NeftTab;

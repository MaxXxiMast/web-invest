// Components
import Accordian from '../../primitives/Accordian';
import CopyToClipboardWidget from '../../primitives/CopyToClipboard';
import Image from '../../primitives/Image';

// Utils
import {
  giveInstructionList,
  NeftBankDetails,
  NeftSteps,
} from '../../../utils/investment';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Styles
import classes from './BankDetailsModalUI.module.css';

type NeftDetailsData = Partial<{
  beneficiaryName: string;
  accountNo: string;
  ifscCode: string;
  accountType: string;
  bankName: string;
}>;

type RenderBankDetailModalProps = {
  neftDetails: NeftDetailsData;
  settlementDate: string;
  totalPayableAmount: number | string;
};

const getNeftStepsText = (val: string[]) => {
  let joinStr = '';
  val.forEach((ele) => {
    joinStr = joinStr.concat(`- ${ele}\n`);
  });
  return joinStr.trim();
};

const RenderBankDetailValue = (data: { id: string; value: string }) => {
  const { id, value } = data;
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

const RenderBankDetails = ({ neftDetails }) => {
  const dataToCopy: string = `You'll need to make the payment to following bank account after placing the order\n
        Beneficiary Name: ${neftDetails?.beneficiaryName ?? ''}
        Account Number: ${neftDetails?.accountNo ?? ''}
        IFSC Code: ${neftDetails?.ifscCode ?? ''}
        Account Type: ${
          (neftDetails?.accountType?.charAt(0)?.toUpperCase() ?? '') +
          (neftDetails?.accountType?.slice(1) ?? '' ?? '')
        }
        Bank Name: ${neftDetails?.bankName ?? ''}\n\n${getNeftStepsText(
    NeftSteps
  )}`;

  return (
    <div className={`${classes.CardTop} flex direction-column`}>
      <div className={`${classes.Left} flex direction-column`}>
        <ul className={`${classes.BankList} flex direction-column`}>
          {NeftBankDetails.map((ele) => {
            const { id, label } = ele || {};
            let value = neftDetails?.[id] ?? '';
            if (id === 'accountType') {
              value =
                (value?.charAt(0)?.toUpperCase() || '') +
                (value?.slice(1) ?? '');
            }
            return (
              <li className="flex" key={id}>
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

const RenderInstructionTxt = () => {
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

const RenderInstructions = ({ settlementDate, totalPayableAmount }) => {
  return (
    <ol className={`flex-column ${classes.InstructionList}`}>
      {giveInstructionList({
        settlementDate: settlementDate,
        totalPayableAmount: totalPayableAmount,
      }).map((item, index) => {
        return (
          <li key={`accordian-${item?.title}`}>
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

export default function RenderBankDetailModalUI({
  neftDetails,
  settlementDate,
  totalPayableAmount,
}: RenderBankDetailModalProps) {
  return (
    <div className={`flex direction-column ${classes.Wrapper} `}>
      <p className={classes.PayTitle}>Pay to Account</p>
      <RenderBankDetails neftDetails={neftDetails} />
      <RenderInstructionTxt />
      <div className={classes.Instructions}>
        <RenderInstructions
          settlementDate={settlementDate}
          totalPayableAmount={totalPayableAmount}
        />
      </div>
    </div>
  );
}

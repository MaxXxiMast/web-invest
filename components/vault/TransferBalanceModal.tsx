import MaterialModalPopup from '../primitives/MaterialModalPopup';
import Button from '../primitives/Button';
import { callSuccessToast } from '../../api/strapi';
import styles from '../../styles/Vault/WithdrawlModal.module.css';

const TransferBalanceModal = (props: any) => {
  const {
    walletSummary,
    userData,
    className,
    showModal = false,
    handleModalClose,
  } = props;
  const bankName = 'YES BANK';
  const branch = 'Tower ifc2, Mumbai';
  const ifscCode = 'YESB0CMSNOC';
  const copyToClipboard = (val: any) => {
    navigator.clipboard.writeText(val).then(
      function () {
        callSuccessToast('Copying to clipboard was successful!');
      },
      function (err) {
        console.error('Async: Could not copy text: ', err);
      }
    );
  };

  const getUserAccountHolderName = () => {
    return userData?.firstName + ' ' + userData?.lastName;
  };

  const copyAll = () => {
    const dataToCopy = `
      Bank: ${bankName}\n
      Branch: ${branch}\n
      Account Holder’s Name: ${getUserAccountHolderName()}\n
      Account Number: ${walletSummary?.van}\n
      IFSC Code: ${ifscCode}`;
    copyToClipboard(dataToCopy);
  };

  return (
    <MaterialModalPopup
      handleModalClose={(res: boolean) => handleModalClose(res)}
      showModal={showModal}
      isModalDrawer
      className={`${className} ${styles.TransferBalanceModal}`}
    >
      <div className={`${styles.ModalHeader}`}>
        <h4 className="Heading5">Transfer via NEFT/RTGS/IMPS</h4>
      </div>
      <div className={`${styles.ModalBody} ModalBody`}>
        <div className={styles.BankAccountDetails}>
          <h3 className="TextStyle1">
            <span className={`icon-bank ${styles.BankIcon}`} />
            Transfer to below account
          </h3>
          <ul>
            <li>
              <span>Bank</span>
              <span>
                {bankName}{' '}
                <span
                  className={`icon-copy ${styles.CopyIcon}`}
                  onClick={() => copyToClipboard(bankName)}
                />
              </span>
            </li>
            <li>
              <span>Branch</span>
              <span>
                {branch}
                <span
                  className={`icon-copy ${styles.CopyIcon}`}
                  onClick={() => copyToClipboard(branch)}
                />
              </span>
            </li>
            <li>
              <span>Account Holder’s Name</span>
              <span>
                {getUserAccountHolderName()}
                <span
                  className={`icon-copy ${styles.CopyIcon}`}
                  onClick={() => copyToClipboard(getUserAccountHolderName())}
                />
              </span>
            </li>
            <li>
              <span>Account Number</span>
              <span>
                {walletSummary.van}
                <span
                  className={`icon-copy ${styles.CopyIcon}`}
                  onClick={() => copyToClipboard(walletSummary.van)}
                />
              </span>
            </li>
            <li>
              <span>IFSC Code</span>
              <span>
                {ifscCode}
                <span
                  className={`icon-copy ${styles.CopyIcon}`}
                  onClick={() => copyToClipboard(ifscCode)}
                />
              </span>
            </li>
          </ul>
        </div>

        <div className={styles.Note}>
          <p className="TextStyle2">
            <span>
              <strong>Note:</strong>
            </span>
            <span>
              You need to transfer the amount from your registered bank account
              only.
            </span>
          </p>
        </div>
      </div>
      <div className={styles.ModalFooter}>
        <Button className={styles.WithdrawBtn} onClick={copyAll}>
          Copy All
        </Button>
      </div>
    </MaterialModalPopup>
  );
};

export default TransferBalanceModal;

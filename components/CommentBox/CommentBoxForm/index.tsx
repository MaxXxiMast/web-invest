// NODE_MODULES
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import dompurify from 'dompurify';

// Utils
import { defaultOptions, handleRedirection, maxLengthComment } from '../utils';
import { callErrorToast, processError } from '../../../api/strapi';
import { trackEvent } from '../../../utils/gtm';

// Components
import Button, { ButtonType } from '../../primitives/Button';
import GripSelect from '../../common/GripSelect';
import TextArea from '../../common/TextArea';

// APIS
import { addComment } from '../../../api/user';

// Redux
import { setOpenCommentBox } from '../../../redux/slices/rfq';
import { useAppSelector } from '../../../redux/slices/hooks';
import { getCommentsCountForKYC } from '../../../redux/slices/config';

// Styles
import styles from './CommentBoxForm.module.css';

export type CommentBoxFormData = {
  comment: string;
  type: string;
};

type CommentFormProps = {
  type: string;
  onSuccessSubmit: (obj: CommentBoxFormData) => void;
};

const CommentBoxForm = ({ type, onSuccessSubmit }: CommentFormProps) => {
  const sanitizer = dompurify.sanitize;
  const router = useRouter();
  const dispatch = useDispatch();
  const { userID } = useAppSelector((state) => state?.user.userData);
  const { gcCallbackUrl } = useAppSelector((state) => state?.gcConfig?.gcData);

  const [formData, setFormData] = useState<CommentBoxFormData>({
    comment: '',
    type: type,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnSubmit = async () => {
    try {
      // Added Sanitizer before sending the payload
      const data = {
        type: formData?.type,
        comment: sanitizer(formData.comment),
      };
      setLoading(true);
      await addComment(data);
      onSuccessSubmit(formData);
      dispatch(getCommentsCountForKYC() as any);
    } catch (err) {
      callErrorToast(processError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTextField = (event: any) => {
    const value = event?.target?.value;
    if (value.length > maxLengthComment) {
      return;
    }

    setFormData({ ...formData, comment: event?.target?.value });
  };

  const renderNoOfCharactersLeft = () => {
    const noOfCharactersLeft = maxLengthComment - formData.comment.length;
    const characterLimitReached = noOfCharactersLeft === 0;
    const message = characterLimitReached
      ? 'Character limit reached'
      : `${noOfCharactersLeft} character${
          noOfCharactersLeft > 9 ? 's' : ''
        } left`;
    return (
      <span
        className={`${styles.characterLeft} ${
          characterLimitReached ? 'NoComment' : ''
        }`}
      >
        {message}
      </span>
    );
  };

  const handleOnSkip = () => {
    trackEvent('Close_skip', {
      page: router.pathname,
      userID: userID,
      cta_clicked: 'Skip',
    });
    dispatch(setOpenCommentBox(false));
    // Only go to discover when opened on user-kyc page
    if (router.pathname === '/user-kyc') {
      router.push(handleRedirection(gcCallbackUrl));
    }
  };

  return (
    <div className={`flex-column ${styles.container}`}>
      <GripSelect
        id="IssueType"
        showScrollbar
        value={formData.type}
        onChange={(e: any) => {
          setFormData({ ...formData, type: e?.target?.value });
        }}
        options={defaultOptions}
        placeholder={'Select a module you need help with'}
        classes={{
          formControlRoot: styles.dropDownContainer,
        }}
        name="type"
      />
      <div>
        <TextArea
          labelText={'Type your issue here'}
          value={formData.comment}
          id="IssueComment"
          multiline
          onChange={handleTextField}
          error={''}
          classes={{
            input: styles.inputComment,
            inputPropsRoot: styles.inputPropsRoot,
          }}
        />
        {renderNoOfCharactersLeft()}
      </div>
      <div className={`flex ${styles.buttonContainer}`}>
        {!['/discover', '/assets'].includes(router?.pathname) ? (
          <Button
            className={styles.submitButton}
            onClick={handleOnSkip}
            disabled={loading}
            variant={ButtonType.Inverted}
          >
            Skip
          </Button>
        ) : null}

        <Button
          className={styles.submitButton}
          onClick={handleOnSubmit}
          disabled={loading || !Boolean(formData.type && formData.comment)}
          isLoading={loading}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CommentBoxForm;

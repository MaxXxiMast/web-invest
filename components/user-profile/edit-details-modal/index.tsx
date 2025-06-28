import GenericModal from '../../user-kyc/common/GenericModal';

// STYLESHEETS
import classes from './EditProfileDetails.module.css';

type Props = {
  showEditModal: boolean;
  editData: {
    title?: string;
    subtitle?: string;
  };
  handleEditModal?: () => void;
};

const EditProfileDetails = ({
  editData = {},
  showEditModal = false,
  handleEditModal = () => {},
}: Props) => {
  const { title, subtitle } = editData;
  const RenderEditModalText = () => {
    return (
      <p>
        To submit the change request please mail to -
        <a
          rel="noreferrer"
          className={classes.hyperLink}
          href="mailto:invest@gripinvest.in"
          target="_blank"
        >
          invest@gripinvest.in
        </a>
      </p>
    );
  };

  return (
    <div>
      <GenericModal
        showModal={showEditModal}
        title={title ? `Get in touch to edit ${title} details` : ''}
        subtitle={
          subtitle
            ? `Making changes to ${subtitle} detail(s) 
        will require you to fill a form, sign it and courier to us. `
            : ''
        }
        Content={RenderEditModalText}
        icon={`EditMessageIcon.svg`}
        btnText={'OKAY'}
        btnVariant="SecondaryLight"
        handleBtnClick={handleEditModal}
        isModalDrawer
        drawerExtraClass={classes.Modal}
      />
    </div>
  );
};

export default EditProfileDetails;

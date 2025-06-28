import dynamic from 'next/dynamic';
import { handleExtraProps } from '../../../utils/string';

const EditProfileDetails = dynamic(() => import('../edit-details-modal'), {
  ssr: false,
});

import classes from './SectionTitle.module.css';

type Props = {
  title: string;
  className?: string;
  isSectionTitle?: boolean;
  showEditBtn?: boolean;
  showEditModal?: boolean;
  editData?: {
    editTitle?: string;
    subtitle?: string;
  };
  editText?: string;
  handleEditModal?: () => void;
};

export const FormTitle = ({
  title,
  className = '',
  isSectionTitle = false,
  showEditBtn = false,
  editText = 'Request Edit',
  editData = {},
  showEditModal = false,
  handleEditModal = () => {},
}: Props) => {
  if (!title) return;
  const { editTitle, subtitle } = editData;

  return (
    <div
      className={`${
        isSectionTitle ? classes.TitleContainer : 'flex'
      } ${handleExtraProps(className)}`}
    >
      <h3 className={isSectionTitle ? classes.Title : classes.FormTitle}>
        {title}
      </h3>
      {showEditBtn ? (
        <button
          className={`flex items-center ${classes.EditPencilBtn}`}
          onClick={handleEditModal}
        >
          <span className={`icon-edit ${classes.Pencil}`} />
          {editText}
        </button>
      ) : null}
      <EditProfileDetails
        showEditModal={showEditModal}
        editData={{
          title: editTitle || title,
          subtitle: subtitle || title,
        }}
        handleEditModal={handleEditModal}
      />
    </div>
  );
};

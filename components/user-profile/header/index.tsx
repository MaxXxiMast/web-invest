import { useAppSelector } from '../../../redux/slices/hooks';
import { isGCOrder } from '../../../utils/gripConnect';
import EditProfileDetails from '../edit-details-modal';
import classes from './Header.module.css';

type Props = {
  title?: string;
  showRightBtn?: boolean;
  className?: string;
  onBackClick?: () => void;
  onBookClick?: () => void;
  showEditBtn?: boolean;
  handleEditModal?: () => void;
  showEditModal?: boolean;
  editData?: {
    editTitle?: string;
    subtitle?: string;
  };
};
const ProfileHeader = ({
  onBackClick,
  onBookClick,
  title = 'My Account',
  showRightBtn = true,
  className = '',
  showEditBtn = false,
  showEditModal = false,
  editData = {},
  handleEditModal = () => {},
}: Props) => {
  const { editTitle, subtitle } = editData;

  const profileGCConfig = useAppSelector(
    (state) => state.gcConfig.configData?.themeConfig?.pages?.profile
  );

  const isShowBookCall = isGCOrder()
    ? !profileGCConfig?.hideBookCallTopNav
    : true;

  return (
    <div className={`${classes.Header} ${className}`}>
      <div className="containerNew">
        <div className={`flex ${classes.HeaderWrapper}`}>
          <div className={`flex items-center ${classes.Left}`}>
            <span onClick={onBackClick} className={classes.Back}>
              <span className={`icon-arrow-left ${classes.ArrowLeft}`} />
            </span>
            <span
              className={`${classes.Title} ${
                showEditBtn ? classes.PaddingLeft : null
              }`}
            >
              {title}
            </span>
            {showEditBtn ? (
              <button
                className={`flex items-center ${classes.EditPencilBtn}`}
                onClick={handleEditModal}
              >
                <span className={`icon-edit ${classes.Pencil}`} />
                Request Edit
              </button>
            ) : null}
          </div>
          {isShowBookCall && showRightBtn ? (
            <div className={classes.Right}>
              <span className={classes.BookCall} onClick={onBookClick}>
                Book A Call
              </span>
            </div>
          ) : null}
        </div>
      </div>
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

export default ProfileHeader;

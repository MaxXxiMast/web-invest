import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './SidebarSkeleton.module.css';

const SidebarSkeleton = ({ isMobileDevice = false }) => {
  const filterItem = (index: number) => {
    return (
      <div key={`side-bar-${index}`} className={`${classes.flexColumnDir}`}>
        <CustomSkeleton
          styles={{
            width: 100,
            height: 25,
          }}
        />
      </div>
    );
  };
  if (isMobileDevice) {
    return (
      <div className={`flex ${classes.sidebarMobile}`}>
        {Array.from(Array(6), (e, index) => {
          return filterItem(index);
        })}
      </div>
    );
  }
  return (
    <CustomSkeleton
      styles={{
        width: '100%',
        height: 220,
      }}
    />
  );
};

export default SidebarSkeleton;

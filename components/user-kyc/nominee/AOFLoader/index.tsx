// NODE MODULES
import dynamic from 'next/dynamic';

// Components
import DelayTextChange from '../../../primitives/DelayTextChange';
import AOFProgressBar from './AOFProgressBar';

// Utils
import { NomineeStatus, nomineeDelayArr } from '../../utils/NomineeUtils';

// styles
import classes from './AOFLoader.module.css';

// Dynamic Components
const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const aofGenerating = NomineeStatus.generatingAOF;

type AOFLoaderProps = {
  open: boolean;
};

export default function AOFLoader({ open }: AOFLoaderProps) {
  const renderDelayTextComp = () => {
    return (
      <div className={classes.DelayTextChangeComponent}>
        <DelayTextChange dataArr={nomineeDelayArr} />
      </div>
    );
  };

  return (
    <GenericModal
      isModalDrawer
      showModal={open}
      title={aofGenerating.title}
      subtitle={aofGenerating.subtitle}
      icon={aofGenerating.icon}
      iconHeight={83}
      iconWidth={83}
      Content={renderDelayTextComp}
      drawerExtraClass={classes.MobileModal}
      wrapperExtraClass={classes.ModalWrapper}
    >
      <AOFProgressBar isOpen={open} />
    </GenericModal>
  );
}

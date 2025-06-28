import { useContext } from 'react';

// Components
import Image from '../../Image';
import MegaMenuLinkItem from '../MegaMenuLinkItem';

// Utils
import { trackEvent } from '../../../../utils/gtm';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

//hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Context
import { GlobalContext } from '../../../../pages/_app';

// Styles
import classes from './ToolsMenu.module.css';

type CategoriesLinkType = {
  id: number;
  title: string;
  shortDescription: string;
  clickUrl: string;
  icon: string;
  openInNewTab: boolean;
  isBgFilledIcon: boolean;
  subLinks?: CategoriesLinkType[];
};

const ToolsMenu: React.FC = () => {
  const { toolsCategory }: any = useContext(GlobalContext);
  const userID = useAppSelector((state) => state?.user?.userData?.userID) || '';
  const personaName = useAppSelector(
    (state) => state?.knowYourInvestor?.customerPersonality
  );

  const handleClick = (quiz_taken: boolean, cta_text: string) => {
    trackEvent('kyi_banner_clicked', {
      cta_text: cta_text,
      section: 'Tools',
      quiz_taken,
      isLoggedIn: !!userID,
    });
  };

  const renderCol = (menuData: CategoriesLinkType[]) => {
    return menuData.map((ele) => (
      <MegaMenuLinkItem
        key={`${ele.title}__title`}
        title={ele.title}
        clickUrl={ele.clickUrl}
        shortDescription={ele.shortDescription}
        openInNewTab={ele.openInNewTab}
        isBgFilledIcon={ele.isBgFilledIcon}
        handleClick={() => handleClick(Boolean(personaName), ele.title)}
        icon={
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}${ele.icon}`}
            alt={ele.title}
            width={30}
            height={30}
            layout="fixed"
          />
        }
        subLinks={ele.subLinks || []}
      />
    ));
  };

  return (
    <div className={`${classes.Row} flex-column`}>
      <div className={`${classes.MenuSection} flex-column`}>
        <div className={`${classes.Col} flex`}>
          <div className={classes.ColLeft}>
            {renderCol(toolsCategory.childrenLinks)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsMenu;

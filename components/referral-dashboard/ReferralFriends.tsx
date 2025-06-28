import React from 'react';
import ReferralTable from './ReferralTable';
import Tabination from '../primitives/Tabination/Tabination';
import RefereeCard from './RefereeCard';
import StatusTag from './StatusTag';
import styles from '../../styles/Referral/ReferralFriends.module.css';
import { converToDateFormat } from '../../utils/date';
// NOSONAR: This line is commented for future use
// import { getDiffernceInTwoDates } from '../../utils/date';
import NoData from '../../components/common/noData';
import MenuOptions from '../common/menu';

type Props = {
  data?: any;
  className?: any;
  noData?: any;
};

type TableData = {
  userName: string;
  userEmail: string;
  registerDate: string;
  status: string;
  nudge: string;
  nudgeType: string;
  refereeUserID: string | number;
};

const TableHeaders: any[] = ['Referee', 'Registered on', 'Status', 'Nudge'];

const tabArr: any[] = ['All', 'Registered', 'Invested'];

const ReferralFriends = ({ data, className, noData }: Props) => {
  const { referredFriends = [] } = data;
  const [anchorEl, setAnchorEl] = React.useState<null | Element>(null);
  const [activeTab, setActiveTab] = React.useState(tabArr[0]);
  const [activeFilter, setActiveFilter] = React.useState('');
  const isDataEmpty: boolean = referredFriends.length ? false : true;

  const handleClick = (event: React.MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget);
  };
  const tabChangeEvent = (tabName: any) => {
    setActiveTab(tabName);
  };
  const referredFriendsData: TableData[] = referredFriends.map(
    (friend: Record<any, any>) => {
      // NOSONAR: This line is commented for future use
      // const nudgeDifference = getDiffernceInTwoDates(
      //   new Date(),
      //   friend?.lastNudge
      // );
      return {
        userName: friend?.firstName + ' ' + friend?.lastName,
        userEmail: friend?.refereeEmailID,
        registerDate: converToDateFormat(friend?.registeredAt),
        status: friend?.status,
        nudge: '',
        //   friend?.status?.toLowerCase() === 'invested'
        //     ? ''
        //     : `Nudge again after ${7 - nudgeDifference} days`,
        // nudgeType:
        //   friend?.status?.toLowerCase() === 'invested'
        //     ? 'text'
        //     : nudgeDifference > 0 && nudgeDifference < 7
        //     ? 'text'
        //     : 'link',
        refereeUserID: friend?.refereeUserID,
      };
    }
  );
  const menuChanged = (item) => {
    setActiveFilter(item);
  };
  const onMenuClose = () => {
    setAnchorEl(null);
  };

  const MobileCard = ({ data }: any) => {
    return (
      <div className={styles.MobileCard}>
        <div className={styles.CardBody}>
          <StatusTag status={data.status} className={styles.CardStatus} />
          <RefereeCard className={styles.RefereeCard} data={data} />
          <div className={`${styles.RegisterDate} TextStyle1`}>
            {data.registerDate}
          </div>
        </div>
        {/* {data.nudge && (
          <div className={styles.CardFooter}>
            {data.nudgeType === 'text' ? (
              <div className={styles.NudgeText}>
                <span className="TextStyle2">{data.nudge} </span>
              </div>
            ) : (
              <>
                <div
                  className={styles.NudgeLink}
                  onClick={() => dispatch(handleRemindNow(data?.refereeUserID))}
                >
                  <img
                    src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/referralDashboard/Nudge.svg`}
                    alt="Nudge"
                  />
                  <span className="TextStyle2">Nudge</span>
                </div>
              </>
            )}
          </div>
        )} */}
      </div>
    );
  };
  return (
    <div className={`${styles.ReferralFriends} ${className}`}>
      <h3 className={`${styles.WidgetTitle} Heading2`}>
        Referred Friends
        <div className={styles.FilterBtn} onClick={handleClick}>
          <span className="TextStyle1" id="filter">
            Filter By
          </span>
          <span className={`${styles.CaretDown} icon-caret-down`} />
        </div>
        <MenuOptions
          options={tabArr}
          changeActiveFilter={menuChanged}
          onClose={onMenuClose}
          anchorElement={anchorEl}
        />
      </h3>
      {isDataEmpty ? (
        <NoData
          header={noData?.attributes?.header}
          subHeader={noData?.attributes?.subHeader}
        />
      ) : (
        <>
          {/* DESKTOP SECTION */}
          <ReferralTable
            className={styles.ReferralTable}
            data={referredFriendsData}
            headers={TableHeaders}
            rowsPerPage={5}
            filter={activeFilter}
          />

          {/* MOBILE SECTION */}
          <div className={styles.MobileTabination}>
            <Tabination
              showShortBy={false}
              tabArr={tabArr}
              className={`${styles.MobileReferalTab}`}
              activeTab={activeTab}
              tabContentClass={styles.MobileReferalTabContent}
              handleTabChange={(tabName: any) => tabChangeEvent(tabName)}
            >
              <div tab-ele={`All`}>
                {referredFriendsData.map((item) => {
                  return <MobileCard data={item} key={`MobileCard_${item}`} />;
                })}
              </div>
              <div tab-ele={`Registered`}>
                {referredFriendsData
                  .filter((item) => item.status === 'registered')
                  .map((item, index) => {
                    return (
                      <MobileCard data={item} key={`MobileCard_${item}`} />
                    );
                  })}
              </div>
              <div tab-ele="Invested">
                {referredFriendsData
                  .filter((item) => item.status === 'invested')
                  .map((item, index) => {
                    return (
                      <MobileCard data={item} key={`MobileCard_${item}`} />
                    );
                  })}
              </div>
            </Tabination>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralFriends;

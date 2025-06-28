// Components
import Image from '../../primitives/Image';

// utlis
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../../utils/string';
import { copy } from '../../../utils/customHooks/useCopyToClipBoard';
import { useAppSelector } from '../../../redux/slices/hooks';

// styles
import styles from './ShareDealDetails.module.css';

const ShareDealDetails = () => {
  const asset = useAppSelector((state) => state.assets.selectedAsset);

  const socialMediaMobile: Record<string, any> = {
    Mail: {
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/EmailIcon.svg`,
      label: 'Mail',
      link: `mailto:?body=Invest with ${encodeURIComponent(
        asset && asset.partnerName
      )}: ${encodeURIComponent(asset && asset.desc)}%0A${
        window.location.href
      }&subject=Check this out at Grip`,
    },
    Whatsapp: {
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Whatsapp.svg`,
      label: 'Whatsapp',
      link: `https://api.whatsapp.com/send?text=Invest with ${encodeURIComponent(
        asset && asset?.partnerName
      )}: ${encodeURIComponent(asset && asset.desc)}%0A${window.location.href}`,
    },
    Copy: {
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/OtherShare.svg`,
      label: 'Copy',
    },
  };

  const handleCopyToClipboard = () => {
    copy(window.location.href);
  };
  return (
    <div>
      <div className="items-align-center-row-wise">
        <h3 className={styles.ModalHeader}>Share Deal</h3>
      </div>
      <div>
        <div className={`flex ${styles.ReferralCodeLeftInner}`}>
          <div className={styles.LinkUrlField}>{window.location.href}</div>
          <span onClick={handleCopyToClipboard}>
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/CopyIcon.svg`}
              alt="CopyIcon"
            />
          </span>
        </div>
        <div className={styles.LinkShareList}>
          <ul>
            {Object.values(socialMediaMobile).map((media: any) => {
              return (
                <li key={`socialMobile-${media?.label}`}>
                  <div className={`${styles.ShareLinkItem} text-center`}>
                    <div
                      className={`items-align-center-row-wise ${styles.ShareLinkIcon}`}
                      onClick={() => {
                        if (media.label === 'Copy') {
                          handleCopyToClipboard();
                        } else {
                          window.open(media.link, '_blank');
                        }
                      }}
                    >
                      <Image 
                        src={media.src} 
                        alt="media.label"
                        layout={'intrinsic'}
                        width={20}
                        height={20} 
                      />
                    </div>
                    <p className="TextStyle2 text-center">{media.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareDealDetails;

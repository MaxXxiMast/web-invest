import Head from 'next/head';
import CopyToClipboardWidget from '../../components/primitives/CopyToClipboard';

const GripFonts = () => {
  const iconList = [
    {
      iconName: 'icon-shield',
      name: 'shield',
    },
    {
      iconName: 'icon-property',
      name: 'Property',
    },
    {
      iconName: 'icon-download',
      name: 'Download',
    },
    {
      iconName: 'icon-inventory',
      name: 'inventory',
    },
    {
      iconName: 'icon-pie-chart',
      name: 'pie-chart',
    },
    {
      iconName: 'icon-shield-user',
      name: 'shield-user',
    },
    {
      iconName: 'icon-badge',
      name: 'badge',
    },
    {
      iconName: 'icon-clock-circle',
      name: 'clock-circle',
    },
    {
      iconName: 'icon-crown',
      name: 'crown',
    },
    {
      iconName: 'icon-cycle',
      name: 'cycle',
    },
    {
      iconName: 'icon-graph-up',
      name: 'graph-up',
    },
    {
      iconName: 'icon-invest-plant',
      name: 'invest-plant',
    },
    {
      iconName: 'icon-key',
      name: 'key',
    },
    {
      iconName: 'icon-meteor',
      name: 'meteor',
    },
    {
      iconName: 'icon-piggy-bank',
      name: 'piggy-bank',
    },
    {
      iconName: 'icon-settings',
      name: 'settings',
    },
    {
      iconName: 'icon-star-dark',
      name: 'star-dark',
    },
    {
      iconName: 'icon-zap',
      name: 'zap',
    },
    {
      iconName: 'icon-amo-icon',
      name: 'amo-icon',
    },
    {
      iconName: 'icon-arrow-down',
      name: 'arrow-down',
    },
    {
      iconName: 'icon-arrow-left',
      name: 'arrow-left',
    },
    {
      iconName: 'icon-arrow-right-semi-circle',
      name: 'arrow-right-semi-circle',
    },
    {
      iconName: 'icon-arrow-right',
      name: 'arrow-right',
    },
    {
      iconName: 'icon-arrow-up',
      name: 'arrow-up',
    },
    {
      iconName: 'icon-bag',
      name: 'bag',
    },
    {
      iconName: 'icon-bell',
      name: 'bell',
    },
    {
      iconName: 'icon-building',
      name: 'building',
    },
    {
      iconName: 'icon-caret-down-circle',
      name: 'caret-down-circle',
    },
    {
      iconName: 'icon-caret-down',
      name: 'caret-down',
    },
    {
      iconName: 'icon-caret-left-circle',
      name: 'caret-left-circle',
    },
    {
      iconName: 'icon-caret-left',
      name: 'caret-left',
    },
    {
      iconName: 'icon-caret-right-circle',
      name: 'caret-right-circle',
    },
    {
      iconName: 'icon-caret-right',
      name: 'caret-right',
    },
    {
      iconName: 'icon-caret-up-circle',
      name: 'caret-up-circle',
    },
    {
      iconName: 'icon-caret-up',
      name: 'caret-up',
    },
    {
      iconName: 'icon-case',
      name: 'case',
    },
    {
      iconName: 'icon-check-circle',
      name: 'check-circle',
    },
    {
      iconName: 'icon-copy',
      name: 'copy',
    },
    {
      iconName: 'icon-danger-triangle',
      name: 'danger-triangle',
    },
    {
      iconName: 'icon-deal-sheet',
      name: 'deal-sheet',
    },
    {
      iconName: 'icon-dots',
      name: 'dots',
    },
    {
      iconName: 'icon-edit',
      name: 'edit',
    },
    {
      iconName: 'icon-facebook',
      name: 'facebook',
    },
    {
      iconName: 'icon-file',
      name: 'file',
    },
    {
      iconName: 'icon-globe',
      name: 'globe',
    },
    {
      iconName: 'icon-info-dark',
      name: 'info-dark',
    },
    {
      iconName: 'icon-info',
      name: 'info',
    },
    {
      iconName: 'icon-instagram',
      name: 'instagram',
    },
    {
      iconName: 'icon-link',
      name: 'link',
    },
    {
      iconName: 'icon-linkedin',
      name: 'linkedin',
    },
    {
      iconName: 'icon-lock',
      name: 'lock',
    },
    {
      iconName: 'icon-money-plant',
      name: 'money-plant',
    },
    {
      iconName: 'icon-pan',
      name: 'pan',
    },
    {
      iconName: 'icon-question',
      name: 'question',
    },
    {
      iconName: 'icon-refer',
      name: 'refer',
    },
    {
      iconName: 'icon-rupees',
      name: 'rupees',
    },
    {
      iconName: 'icon-rupees2',
      name: 'rupees2',
    },
    {
      iconName: 'icon-star',
      name: 'star',
    },
    {
      iconName: 'icon-suitcase',
      name: 'suitcase',
    },
    {
      iconName: 'icon-tick-success',
      name: 'tick-success',
    },
    {
      iconName: 'icon-transaction',
      name: 'transaction',
    },
    {
      iconName: 'icon-twitter',
      name: 'twitter',
    },
    {
      iconName: 'icon-video',
      name: 'video',
    },
    {
      iconName: 'icon-visualise-returns',
      name: 'visualise-returns',
    },
    {
      iconName: 'icon-weighing-scale',
      name: 'weighing-scale',
    },
    {
      iconName: 'icon-whatsapp',
      name: 'whatsapp',
    },
    {
      iconName: 'icon-equilibrist',
      name: 'equilibrist',
    },
    {
      iconName: 'icon-hat',
      name: 'hat',
    },
    {
      iconName: 'icon-horse',
      name: 'horse',
    },
    {
      iconName: 'icon-rocket',
      name: 'rocket',
    },
    {
      iconName: 'icon-task-list',
      name: 'task-list',
    },
    {
      iconName: 'icon-tick',
      name: 'tick',
    },
    {
      iconName: 'icon-sell-anytime',
      name: 'sell-anytime',
    },
    {
      iconName: 'icon-sell-anytime-outline',
      name: 'sell-anytime-outline',
    },
    {
      iconName: 'icon-compass',
      name: 'compass',
    },
    {
      iconName: 'icon-group-people',
      name: 'group-people',
    },
    {
      iconName: 'icon-cross',
      name: 'cross',
    },
    {
      iconName: 'icon-fire',
      name: 'fire',
    },
    {
      iconName: 'icon-search',
      name: 'search',
    },
    {
      iconName: 'icon-sort',
      name: 'sort',
    },
    {
      iconName: 'icon-twitter-x',
      name: 'twitter-x',
    },
    {
      iconName: 'icon-upload',
      name: 'upload',
    },
    {
      iconName: 'icon-wallet',
      name: 'wallet',
    },
    {
      iconName: 'icon-bank',
      name: 'bank',
    },
    {
      iconName: 'icon-mail-2',
      name: 'mail',
    },
    {
      iconName: 'icon-refer-rupees',
      name: 'refer-rupees',
    },
    {
      iconName: 'icon-bank-cross',
      name: 'bank-cross',
    },
    {
      iconName: 'icon-histogram',
      name: 'histogram',
    },
    {
      iconName: 'icon-withdraw',
      name: 'withdraw',
    },
    {
      iconName: 'icon-quick',
      name: 'quick',
    },
    {
      iconName: 'icon-marketplace',
      name: 'marketplace',
    },
    {
      iconName: 'icon-filter',
      name: 'filter',
    },
    { iconName: 'icon-arrow-45', name: 'arrow-45' },
    { iconName: 'icon-arrow-down-double', name: 'arrow-down-double' },
    { iconName: 'icon-arrow-transfer-round', name: 'arrow-transfer-round' },
    { iconName: 'icon-authentication', name: 'authentication' },
    { iconName: 'icon-bank-dark', name: 'bank-dark' },
    { iconName: 'icon-bank-note', name: 'bank-note' },
    { iconName: 'icon-book-check', name: 'book-check' },
    { iconName: 'icon-book-open-text', name: 'book-open-text' },
    { iconName: 'icon-camera-round', name: 'camera-round' },
    { iconName: 'icon-camera', name: 'camera' },
    { iconName: 'icon-clock-dark', name: 'clock-dark' },
    { iconName: 'icon-close-round-dark', name: 'close-round-dark' },
    { iconName: 'icon-copy-2', name: 'copy-2' },
    { iconName: 'icon-crown-round', name: 'crown-round' },
    { iconName: 'icon-dashed-arrow', name: 'dashed-arrow' },
    { iconName: 'icon-document-2', name: 'document-2' },
    { iconName: 'icon-envolope', name: 'envolope' },
    { iconName: 'icon-exclamation-circle', name: 'exclamation-circle' },
    { iconName: 'icon-exclamation', name: 'exclamation' },
    { iconName: 'icon-exit', name: 'exit' },
    { iconName: 'icon-file-excel', name: 'file-excel' },
    { iconName: 'icon-file-pdf', name: 'file-pdf' },
    { iconName: 'icon-file-protected', name: 'file-protected' },
    { iconName: 'icon-file-search', name: 'file-search' },
    { iconName: 'icon-filter-2', name: 'filter-2' },
    { iconName: 'icon-gallery-vertical-end', name: 'gallery-vertical-end' },
    { iconName: 'icon-gift-2', name: 'gift-2' },
    { iconName: 'icon-gift', name: 'gift' },
    { iconName: 'icon-grip-vector', name: 'grip-vector' },
    { iconName: 'icon-inproress-round-2', name: 'inproress-round-2' },
    { iconName: 'icon-inproress-round', name: 'inproress-round' },
    { iconName: 'icon-list-ordered', name: 'list-ordered' },
    { iconName: 'icon-lock-2', name: 'lock-2' },
    { iconName: 'icon-message-square-text', name: 'message-square-text' },
    { iconName: 'icon-min-investment', name: 'min-investment' },
    { iconName: 'icon-minimize', name: 'minimize' },
    { iconName: 'icon-pending-metrics', name: 'pending-metrics' },
    { iconName: 'icon-percentage-round-wave', name: 'percentage-round-wave' },
    { iconName: 'icon-person', name: 'person' },
    { iconName: 'icon-phone-wave-dark', name: 'phone-wave-dark' },
    { iconName: 'icon-phone-wave', name: 'phone-wave' },
    { iconName: 'icon-pie-25-complete', name: 'pie-25-complete' },
    { iconName: 'icon-pie-25-pending', name: 'pie-25-pending' },
    { iconName: 'icon-play-box', name: 'play-box' },
    { iconName: 'icon-play', name: 'play' },
    { iconName: 'icon-refresh-round', name: 'refresh-round' },
    { iconName: 'icon-report', name: 'report' },
    { iconName: 'icon-reupload', name: 'reupload' },
    { iconName: 'icon-rupees-file-lock', name: 'rupees-file-lock' },
    { iconName: 'icon-rupees-round', name: 'rupees-round' },
    { iconName: 'icon-share', name: 'share' },
    { iconName: 'icon-speaker', name: 'speaker' },
    { iconName: 'icon-star-line', name: 'star-line' },
    { iconName: 'icon-stop-box', name: 'stop-box' },
    { iconName: 'icon-tick-half-round', name: 'tick-half-round' },
    { iconName: 'icon-ticket', name: 'ticket' },
    { iconName: 'icon-update', name: 'update' },
    { iconName: 'icon-upload-2', name: 'upload-2' },
    { iconName: 'icon-user-frame', name: 'user-frame' },
    { iconName: 'icon-user-location', name: 'user-location' },
    { iconName: 'icon-user-setting', name: 'user-setting' },
    { iconName: 'icon-user', name: 'user' },
    { iconName: 'icon-vertical-dots', name: 'vertical-dots' },
    { iconName: 'icon-video-player', name: 'video-player' },
    { iconName: 'icon-wealth', name: 'wealth' },
    { iconName: 'icon-whatsapp-dark', name: 'whatsapp-dark' },
    { iconName: 'icon-diversification', name: 'diversification' },
    { iconName: 'icon-liquidity', name: 'liquidity' },
    { iconName: 'icon-security-cover', name: 'security-cover' },
    { iconName: 'icon-stable-returns', name: 'stable-returns' },
    { iconName: 'icon-quick-start', name: 'quick-start' },
  ];

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <div className="containerNew">
        <div className="Container">
          <style jsx>{`
            .Container {
              padding: 100px 0px;
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
            }
            .gap5 {
              gap: 5px;
            }
            .icon-item {
              gap: 10px;
              font-size: 16px;
              border: 1px solid var(--gripSecondaryOne);
              padding: 10px;
              border-radius: 5px;
              flex: 1 0 30%;
            }
            @media (max-width: 480px) {
              .icon-item {
                flex: 1 0 100%;
              }
            }
          `}</style>
          {iconList.map((icon) => {
            return (
              <div className="flex-column icon-item" key={icon.name}>
                <div className="flex items-center gap5">
                  <i
                    style={{
                      fontSize: '24px',
                    }}
                    className={`grip-icon ${icon.iconName}`}
                  ></i>
                  <code>{icon.iconName}</code>{' '}
                  <CopyToClipboardWidget text={icon.iconName} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default GripFonts;

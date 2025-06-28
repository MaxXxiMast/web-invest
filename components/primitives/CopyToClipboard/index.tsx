import { handleExtraProps } from '../../../utils/string';
import Image from '../Image';
import { callSuccessToast } from '../../../api/strapi';
import classes from './style.module.css';

type Props = {
  text: string;
  className?: string;
  widgetLabel?: string;
  iconUrl?: string;
  iconWidth?: number;
  iconSize?: number;
  iconHeight?: number;
  showToast?: boolean;
  handleCopyFun?: (value: string) => void;
  iconAfterText?: boolean;
  enabled?: boolean;
};

/**
 * Copy to clipboard component
 * @param text Copy text
 * @param iconUrl Icon url to display
 * @param iconWidth Icon width
 * @param iconHeight Icon height
 * @param showToast Show toast on copy
 * @param handleCopyFun Get copied value
 * @returns
 */

const CopyToClipboardWidget = ({
  text = '',
  iconUrl = '',
  widgetLabel = '',
  iconWidth = 14,
  iconHeight = 14,
  iconSize = 14,
  showToast = true,
  className = '',
  handleCopyFun = () => {},
  iconAfterText = false,
  enabled = true,
}: Props) => {
  const handleCopy = () => {
    if (text) {
      if (!navigator?.clipboard) {
        console.warn('Clipboard not supported');
        return false;
      }
      navigator.clipboard.writeText(text).then(
        () => {
          if (showToast) {
            callSuccessToast('Copied to clipboard successfully!');
          }
          handleCopyFun(text);
        },
        function (err) {
          console.error('Async: Could not copy text: ', err);
        }
      );
    }
  };

  const IconComponent = iconUrl ? (
    <Image
      src={iconUrl}
      alt="CopyIcon"
      width={iconWidth}
      height={iconHeight}
      layout="fixed"
    />
  ) : (
    <span
      className={`icon-copy ${classes.Copy}`}
      style={{
        fontSize: iconSize,
      }}
    />
  );

  return (
    <span
      onClick={enabled ? handleCopy : null}
      className={`${classes.Wrapper} ${handleExtraProps(className)}`}
    >
      {iconAfterText ? widgetLabel : null}
      {IconComponent}
      {iconAfterText ? null : widgetLabel}
    </span>
  );
};

export default CopyToClipboardWidget;

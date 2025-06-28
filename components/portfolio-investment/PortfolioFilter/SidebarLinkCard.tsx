//NODE MODULES
import { usePathname } from 'next/navigation';

//STYLES
import styles from './SidebarLinkCard.module.css';

//UTILS
import { trackEvent } from '../../../utils/gtm';

export const SidebarLinkCard = ({
  linkArr = [],
  className = '',
  activeFilter = '',
  handleOnClick = (type?: string) => {},
}) => {
  const pathName = usePathname();
  return (
    <div className={`${styles.SidebarLinkCard} ${className}`}>
      <ul>
        {linkArr.length > 0 &&
          linkArr.map((ele: any) => {
            return (
              <li
                key={ele.id}
                className={`sidebarlistItem  ${ele.id} ${
                  ele.id === activeFilter ? 'Active' : ''
                }`}
                onClick={() => {
                  if (pathName === '/transactions') {
                    trackEvent('transaction_section_switch', {
                      category: ele?.name,
                    });
                  }
                  handleOnClick(ele.id);
                }}
                id={ele.id}
              >
                <span>{ele.name}</span>
                {!ele?.hideCount ? <span>{ele.count}</span> : null}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default SidebarLinkCard;

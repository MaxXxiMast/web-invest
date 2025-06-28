//Node Modules
import React, { useEffect, useRef, useState } from 'react';

//Components
import HighlightLabel from '../HighlightLabel';
import Button, { ButtonType } from '../../../primitives/Button';

//Utils
import { htmlSanitizer } from '../../../../utils/htmlSanitizer';
import { handleExtraProps } from '../../../../utils/string';
import { processContent } from '../../utils';

//Styles
import styles from './ReasonToInvest.module.css';

const ReasonToInvest = ({
  data = [],
  handleModal = (type: string) => {},
  showSeeMore = true,
  className = '',
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(
        contentRef.current.scrollHeight > contentRef.current.offsetHeight
      );
    }
  }, [data]);

  function removeTrailingEmptyTags(content: string): string {
    if (!content) return '';
    content = content.trim();
    const emptyTagAtEndRegex = /<(p|h[1-6])>(\s|&nbsp;|<br\s*\/?>)*<\/\1>\s*$/g;
    return content.replace(emptyTagAtEndRegex, '');
  }

  const handlButton = () => {
    handleModal('resonToInvest');
  };
  return (
    <div
      className={`${styles.reasonsContainer} ${handleExtraProps(className)}`}
      ref={contentRef}
    >
      {data.map((highlightContent) => (
        <React.Fragment key={highlightContent?.title}>
          <HighlightLabel label={highlightContent?.title} />
          <div
            className={`${styles.ContentList} ${styles.contentDescription}`}
            dangerouslySetInnerHTML={{
              __html: htmlSanitizer(
                processContent(
                  removeTrailingEmptyTags(highlightContent.content)
                )
              ),
            }}
          />
        </React.Fragment>
      ))}
      {showSeeMore && isOverflowing ? (
        <div className={styles.bgShadow}>
          <Button
            className={styles.seeMoreCta}
            variant={ButtonType.BorderLess}
            onClick={handlButton}
            width={'100%'}
          >
            See more
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ReasonToInvest;

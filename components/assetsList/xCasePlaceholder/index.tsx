import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import Image from '../../primitives/Image';
import styles from './xCasePlaceholder.module.css';

const RenderIcon = ({ data }) => {
  const imageUrl = data?.image?.url || `icons/less-is-more-assets.svg`;
  return (
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}${imageUrl}`}
      alt={'xCase Banner Icon'}
      width={(data?.image?.aspectRatio || 1) * (data?.image?.height || 100)}
      height={data?.image?.height || 100}
      layout="fixed"
    />
  );
};

const XCasePlaceholder = ({ id = '', data, className = '' }) => {
  return (
    <div
      className={`${styles.Wrapper} ${handleExtraProps(className)} flex-column`}
      style={{
        background: data?.background,
      }}
      id={id}
    >
      <RenderIcon data={data} />
      <h3>{data?.title}</h3>
      <ul>
        {((data?.cardOptions as any[]) || []).map((ele) => {
          return <li key={ele}>{ele}</li>;
        })}
      </ul>
    </div>
  );
};

export default XCasePlaceholder;

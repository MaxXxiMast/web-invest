import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import Image from '../Image';

export default function PoweredByGrip() {
  return (
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}icons/powered-by-grip-unit.svg`}
      alt="Powered by GripUnit"
      layout="fixed"
      width={100}
      height={26}
    />
  );
}

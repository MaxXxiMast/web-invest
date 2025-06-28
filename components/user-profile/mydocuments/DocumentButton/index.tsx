// Styless
import styles from './DocumentButton.module.css';

type DocumentButtonProps = {
  key: string;
  name: string;
  onClick: () => void;
};

export default function DocumentButton({
  key,
  name,
  onClick,
}: DocumentButtonProps) {
  return (
    <div
      key={key}
      className={`flex items-center ${styles.Document}`}
      onClick={onClick}
    >
      <span className={`${styles.DownloadIcon} icon-download`} />
      <span>{name}</span>
    </div>
  );
}

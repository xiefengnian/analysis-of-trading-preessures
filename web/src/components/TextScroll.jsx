import styles from './TextScroll.less';

export default ({ children }) => {
  return (
    <div className={styles.box}>
      <p className={styles.animate}>{children}</p>
    </div>
  );
};

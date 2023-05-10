import styles from './TextScroll.less';

export default ({ children }) => {
  return (
    <div class={styles.box}>
      <p class={styles.animate}>{children}</p>
    </div>
  );
};

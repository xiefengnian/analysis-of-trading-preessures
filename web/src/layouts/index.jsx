import { Link, Outlet } from 'umi';
import styles from './index.less';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <p
        style={{
          height: '2em',
          margin: 0,
          fontStyle: 'italic',
          fontWeight: 'bold',
        }}
      >
        Daily monitoring of trading stress
      </p>
      <div style={{ flexGrow: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

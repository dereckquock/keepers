import Image from 'next/image';

import styles from '../../styles/Home.module.css';
import { type User } from '../../types';
import { type KeeperPlayer } from '../keepers/keeperCost';

const COST_BASIS_LABELS = {
  adp: 'added mid-season, priced off ADP',
  draft: 'drafted and held all season',
  minimum: 'no auction value listed, priced at the minimum',
} as const;

export function Team({
  keepers,
  user,
}: {
  keepers: KeeperPlayer[];
  user: User;
}) {
  return (
    <div id={user.user_id}>
      <Header
        avatar={user.avatar}
        displayName={user.display_name}
        teamName={user.metadata?.team_name}
      />
      {keepers.map(({ baseCost, basis, cost, name, playerId, position }) => (
        <div
          className={styles.player}
          key={playerId}
        >
          <div>
            <div>
              {name}
              {position ? (
                <span style={{ color: 'var(--gold)' }}> · {position}</span>
              ) : null}
            </div>
            <small style={{ opacity: 0.7 }}>
              {`$${baseCost} ${COST_BASIS_LABELS[basis]}`}
            </small>
          </div>
          <div className={styles.cost}>{`$${cost}`}</div>
        </div>
      ))}
    </div>
  );
}

function Header({
  avatar,
  displayName,
  teamName,
}: {
  avatar: string;
  displayName: string;
  teamName?: string;
}) {
  return (
    <h2
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: '1rem',
        marginTop: '2.5rem',
      }}
    >
      <Image
        alt="Avatar image"
        className={styles.avatar}
        height={50}
        src={`https://sleepercdn.com/avatars/thumbs/${avatar}`}
        width={50}
      />
      <span>{displayName}</span>
      {teamName ? <span> | {teamName}</span> : null}
    </h2>
  );
}

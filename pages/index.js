import Head from 'next/head';
import styles from '../styles/Home.module.css';
import teams from '../data/teams-2020';

function Team({ manager, players }) {
  return (
    <div>
      <h2 style={{ marginTop: '2.5rem' }}>{manager}</h2>
      {players.map(({ player, cost }) => (
        <div key={player} className={styles.player}>
          <div>{player}</div>
          <div>${cost}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [filter, setFilter] = React.useState('');

  return (
    <div className={styles.container}>
      <Head>
        <title>Keepers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>{`${new Date().getFullYear()} KEEPERS`}</h1>

        <select
          className={styles.dropdown}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">Filter manager</option>
          <option value="1">dereck</option>
          <option value="2">myd</option>
          <option value="3">marc</option>
          <option value="4">dru</option>
          <option value="5">lim</option>
          <option value="6">ejay</option>
          <option value="7">ray</option>
          <option value="8">aaron</option>
          <option value="9">kevin</option>
          <option value="10">ry!t</option>
          <option value="11">bikey mrown</option>
          <option value="12">fatima</option>
        </select>

        <section>
          {[
            <Team key="1" id="1" manager="dereck" players={teams[1]} />,
            <Team key="2" id="2" manager="myd" players={teams[2]} />,
            <Team key="3" id="3" manager="marc" players={teams[3]} />,
            <Team key="4" id="4" manager="dru" players={teams[4]} />,
            <Team key="5" id="5" manager="lim" players={teams[5]} />,
            <Team key="6" id="6" manager="ejay" players={teams[6]} />,
            <Team key="7" id="7" manager="ray" players={teams[7]} />,
            <Team key="8" id="8" manager="aaron" players={teams[8]} />,
            <Team key="9" id="9" manager="kevin" players={teams[9]} />,
            <Team key="10" id="10" manager="ry!t" players={teams[10]} />,
            <Team key="11" id="11" manager="bikey mrown" players={teams[11]} />,
            <Team key="12" id="12" manager="fatima" players={teams[12]} />,
          ].filter(({ props }) => (filter ? props.id === filter : true))}
        </section>
      </main>
    </div>
  );
}

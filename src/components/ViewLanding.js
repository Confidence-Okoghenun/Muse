import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import './ViewLanding.css';
import _ from 'lodash';
import { withRouter, Link } from 'react-router-dom';

const withRouterAndRef = Wrapped => {
  const WithRouter = withRouter(({ forwardRef, ...otherProps }) => (
    <Wrapped ref={forwardRef} {...otherProps} />
  ));
  const WithRouterAndRef = forwardRef((props, ref) => (
    <WithRouter {...props} forwardRef={ref} />
  ));
  const name = Wrapped.displayName || Wrapped.name;
  WithRouterAndRef.displayName = `withRouterAndRef(${name})`;
  return WithRouterAndRef;
};

const InfoCard = ({ allAlbums, allSongs, handleListCardClick, cat }) => (
  <div className='vLanding__info'>
    <div className='vLanding__info__type'>
      <div className='vLanding__info__type__text'>
        {cat === 'artist' ? 'Albums' : 'Artists'}
      </div>
      <div
        data-img
        data-imgname='caret_down'
        className='vLanding__info__type__icon'
      />
    </div>
    <div className='vLanding__info__list'>
      <div
        className='vLanding__info__list__card vLanding__info__list__card--select'
        onClick={() => {
          handleListCardClick(0);
        }}
      >
        <div className='vLanding__info__list__card__wrapper'>
          <div className='vLanding__info__list__card__name'>
            All {cat === 'artist' ? 'albums' : 'artists'}
          </div>
          <div className='vLanding__info__list__card__highlight'></div>
        </div>
      </div>
      {allAlbums.val.map((a, k) => (
        <div
          key={k}
          className='vLanding__info__list__card'
          style={{ backgroundImage: `url(${a.albumArt})` }}
          onClick={() => {
            handleListCardClick(k + 1);
          }}
        >
          <div className='vLanding__info__list__card__wrapper'>
            <div className='vLanding__info__list__card__name'>
              <span>{a.albumName}</span>
            </div>
            <div className='vLanding__info__list__card__highlight'></div>
          </div>
        </div>
      ))}
      <div className='vLanding__info__list__clearFix'>.</div>
    </div>
    <div className='vLanding__info__msc'>
      <div className='vLanding__info__msc__numArtist'>
        {allAlbums.val.length} {cat === 'artist' ? 'albums' : 'album artists'}
      </div>
      <div className='vLanding__info__msc__numSongs'>
        {allSongs.val.length} songs
      </div>
    </div>
  </div>
);

const SongItem = ({
  top,
  itemheight,
  cover,
  name,
  cat,
  album,
  artist,
  url
}) => (
  <Link
    to={{
      data: {
        url,
        name,
        album,
        cover,
        artist
      },
      pathname: `/play/p`,
      search: `?artist=${artist}&song=${name}`
    }}
  >
    <div
      className='vLanding__songs__list__item'
      style={{ top: top, height: itemheight }}
    >
      <div
        className='vLanding__songs__list__item__img'
        style={{ backgroundImage: `url(${cover})` }}
      />
      <div className='vLanding__songs__list__item__text'>
        <div className='vLanding__songs__list__item__text__song truncate'>
          {name}
        </div>
        <div className='vLanding__songs__list__item__text__artist truncate'>
          {cat === 'artist' ? album : artist}
        </div>
      </div>
      <div
        data-img
        data-imgname='menu_horizontal'
        className='vLanding__songs__list__item__option'
      />
    </div>
  </Link>
);

function ViewLanding({ path, songs, history }) {
  path = path.split('/');
  const cat = path[0];
  const id = path[1];
  const allSongsFixed = useRef(null);
  const [allSongs, setAllSongs] = useState({ val: [] });
  const [allAlbums, setAllAlbums] = useState({ val: [] });

  const vh =
    cat === 'songs'
      ? document.documentElement.clientHeight - 201
      : document.documentElement.clientHeight - 411;

  const itemheight = 65;
  const viewPort = useRef(null);

  const numVisibleItems = Math.trunc(vh / itemheight);
  const [scrollState, setScrollSate] = useState({
    start: 0,
    end: numVisibleItems
  });

  const handleScroll = () => {
    let currentIndx = Math.trunc(viewPort.current.scrollTop / itemheight);
    currentIndx =
      currentIndx - numVisibleItems >= allSongs.val.length
        ? currentIndx - numVisibleItems
        : currentIndx;
    if (currentIndx !== scrollState.start) {
      setScrollSate({
        start: currentIndx,
        end:
          currentIndx + numVisibleItems >= allSongs.val.length
            ? allSongs.val.length - 1
            : currentIndx + numVisibleItems
      });
    }
  };

  const handleListCardClick = i => {
    if (cat === 'album') {
      document
        .querySelectorAll('.vLanding__info__list__card')
        .forEach((e, k) => {
          if (k === i) {
            e.classList.add('vLanding__info__list__card--select');
            if (i === 0 || i === 1) {
              /**
               * Do nothing if first or second card is clicked
               */
              setAllSongs({ val: allSongsFixed.current });
            } else {
              /**
               * Show songs containing card name
               */
              const arr = [];
              allSongs.val = allSongsFixed.current;
              const cardName = e.textContent.toLowerCase();

              allSongs.val.forEach(s => {
                const re = /fe?a?t\.?\s/g;
                s.name = s.name.replace(/[^a-zA-Z0-9 \-$]/g, '');
                if (
                  re.test(s.name) &&
                  s.name.search(re) < s.name.lastIndexOf(cardName)
                ) {
                  arr.push(s);
                }
              });
              setAllSongs({ val: arr || allSongs.val });
            }
          } else {
            e.classList.remove('vLanding__info__list__card--select');
          }
        });
    } else if (cat === 'artist') {
      document
        .querySelectorAll('.vLanding__info__list__card')
        .forEach((e, k) => {
          if (k === i) {
            e.classList.add('vLanding__info__list__card--select');
            if (i === 0) {
              /**
               * Do nothing if first card is clicked
               */
              setAllSongs({ val: allSongsFixed.current });
            } else {
              /**
               * Show songs containing card name
               */
              const arr = [];
              allSongs.val = allSongsFixed.current;
              const cardName = e.textContent.toLowerCase();

              allSongs.val.forEach(s => {
                // console.log(s)
                if (s.album.includes(cardName)) {
                  arr.push(s);
                }
              });
              setAllSongs({ val: arr || allSongs.val });
            }
          } else {
            e.classList.remove('vLanding__info__list__card--select');
          }
        });
    }
  };

  const getSongs = useCallback(() => {
    if (cat === 'album') {
      for (const a in songs) {
        for (const s in songs[a]) {
          if (songs[a][s].albumName === id) {
            songs[a][s].albumSongs = songs[a][s].albumSongs.map(ss => ({
              url: ss.url,
              name: ss.name,
              cover: songs[a][s].albumArt,
              artist: songs[a][s].albumArtist,
              album: songs[a][s].albumName
            }));
            allSongsFixed.current = songs[a][s].albumSongs;
            setAllSongs({
              val: songs[a][s].albumSongs
            });

            /**
             * The below block generates card from song names containing feat or ft
             */
            const arr = [
              {
                albumArt: songs[a][s].albumArt,
                albumName: songs[a][s].albumArtist
              }
            ];

            songs[a][s].albumSongs.forEach(ss => {
              let { name } = ss;
              const re = /[^le]fe?a?t\.?\s/g;
              // name.includes('feat.') ||
              // name.includes('ft.') ||
              // name.includes(' feat ') ||
              // name.includes(' ft ') ||
              // name.includes('(feat ') ||
              // name.includes('(ft ')
              if (re.test(name)) {
                const typ = name.includes('feat') ? 'feat' : 'ft';
                name = name.split(typ)[1];
                const save = v => {
                  const obj = {
                    albumName: v.replace(/[^a-zA-Z0-9 \-$]/g, '').trim(),
                    albumArt: ss.cover
                  };

                  if (!_.find(arr, obj)) {
                    arr.push(obj);
                  }
                };

                name.split(/[&,]+/).forEach(n => {
                  save(n);
                });
              }
            });
            setAllAlbums({ val: arr });
            /**
             * End of card generation block
             */
          }
        }
      }
    } else if (cat === 'artist') {
      for (const ar in songs) {
        if (ar === id) {
          setAllAlbums({ val: songs[ar] });
          const arr = [];
          for (const a in songs[ar]) {
            songs[ar][a].albumSongs.forEach(s => {
              arr.push({
                url: s.url,
                name: s.name,
                cover: songs[ar][a].albumArt,
                album: songs[ar][a].albumName,
                artist: songs[ar][a].albumArtist
              });
            });
          }
          allSongsFixed.current = arr;
          setAllSongs({ val: arr });
        }
      }
    } else if (cat === 'songs' && id === 'all songs') {
      const songsArr = [];
      for (const ar in songs) {
        for (const a in songs[ar]) {
          songs[ar][a].albumSongs.forEach(s => {
            songsArr.push({
              url: s.url,
              name: s.name,
              cover: songs[ar][a].albumArt,
              album: songs[ar][a].albumName,
              artist: songs[ar][a].albumArtist
            });
          });
        }
      }
      allSongsFixed.current = songsArr;
      setAllSongs({ val: songsArr });
    }
  }, [cat, id, songs]);

  useEffect(() => {
    getSongs();
  }, [getSongs]);

  const renderSongs = () => {
    let result = [];
    for (let i = scrollState.start; i <= scrollState.end; i++) {
      if (allSongs.val[i]) {
        let item = allSongs.val[i];
        result.push(
          <SongItem
            key={i}
            cat={cat}
            url={item.url}
            name={item.name}
            album={item.album}
            cover={item.cover}
            artist={item.artist}
            top={i * itemheight}
            itemheight={itemheight}
          />
        );
      }
    }
    return result;
  };

  return (
    <div className='vLanding'>
      <div className='vLanding__nav'>
        <div
          data-img
          data-imgname='arrow_left'
          className='vLanding__nav__icon'
          onClick={history.goBack}
        />
        <div className='vLanding__nav__text truncate'>{id}</div>
        <div data-img data-imgname='settings' className='vLanding__nav__icon' />
      </div>
      {cat !== 'songs' ? (
        <InfoCard
          allAlbums={allAlbums}
          allSongs={allSongs}
          handleListCardClick={handleListCardClick}
          cat={cat}
        />
      ) : (
        <div className='' style={{
          color: '#b9b9b9',
          padding:' 0 20px 13px',
          backgroundColor: 'var(--dark-two)',
      }}>
          {allSongs.val.length} songs
        </div>
      )}

      <div className='vLanding__songs'>
        <div className='vLanding__songs__control'>
          <div data-img data-imgname='repeat' />
          <div data-img data-imgname='sort' />
          <div data-img data-imgname='menu_horizontal' />
        </div>

        <div
          ref={viewPort}
          className='vLanding__songs__list'
          onScroll={handleScroll}
          style={{
            height: `calc(${vh}px)`
          }}
        >
          <div
            className='vLanding__songs__list__container'
            style={{ height: allSongs.val.length * itemheight }}
          >
            {renderSongs()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouterAndRef(ViewLanding);

// {allSongs.val.map((s, k) => (
//   // <LazyLoad  placeholder={<LazyLoadPlaceholder />}>
//   // <Link
//   // key={k}

//   //   to={{
//   //     data: s,
//   //     pathname: `/play/p`,
//   //     search: `?artist=${s.artist}&song=${s.name}`
//   //   }}
//   // >
//   <div
//     key={k}
//     className='vLanding__songs__list__item'
//     style={{ top: k * itemHeight.current, height: itemHeight.current }}
//   >
//     <div
//       className='vLanding__songs__list__item__img'
//       style={{ backgroundImage: `url(${s.cover})` }}
//     />
//     <div className='vLanding__songs__list__item__text'>
//       <div className='vLanding__songs__list__item__text__song truncate'>
//         {s.name}
//       </div>
//       <div className='vLanding__songs__list__item__text__artist truncate'>
//         {cat === 'artist' ? s.album : s.artist}
//       </div>
//     </div>
//     <div
//       data-img
//       data-imgname='menu_horizontal'
//       className='vLanding__songs__list__item__option'
//     />
//   </div>
//   // </Link>
//   // </LazyLoad>
// ))}
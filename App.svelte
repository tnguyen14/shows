<script>
  import { onMount } from "svelte";
  import { shows, movies, user } from "./stores.js";
  import { getSession, deleteSession, createAuth } from "@tridnguyen/auth";
  import slugify from "@tridnguyen/slugify";
  import { SHEETS_API_URL, THIRDPARTY_API_URL } from "./config.js";

  const showsSSId = "1t9m4G2uujVZhq8VCrw5VQhxCjT9IVXEeV2SspyhB6cU";
  const auth = createAuth();

  function getUserSession() {
    const session = getSession();
    user.set(session || {});
  }

  function login() {
    auth.silentAuth();
  }

  function logout() {
    deleteSession();
    getUserSession();
  }

  auth.handleCallback((err) => {
    if (err) {
      console.error(err);
      return;
    }
    getUserSession();
  });

  getUserSession();

  const categories = {
    shows: { label: "Shows", sheet: 0, omdbType: "series", store: shows },
    movies: { label: "Movies", sheet: 1, omdbType: "movie", store: movies },
  };

  let category =
    new URLSearchParams(window.location.search).get("type") === "movies"
      ? "movies"
      : "shows";
  let spreadsheet;
  const detailsLoaded = {};

  $: list = categories[category].store;

  function getItemFromRow(row) {
    // an optional trailing year, e.g. "The Fixers (2026)", picks the right
    // title when several shows/movies share the same name
    const [, title, year] = row.cells[0]
      .trim()
      .match(/^(.*?)\s*(?:\((\d{4})\))?$/);
    return {
      title,
      year,
      slug: slugify(title),
      rating: row.cells[1],
    };
  }

  async function getDetails({ title, year }, type) {
    const params = new URLSearchParams({ type, title });
    if (year) {
      params.set("year", year);
    }
    const response = await fetch(`${THIRDPARTY_API_URL}/omdb?${params}`).then(
      (r) => r.json(),
    );
    if (response.Response == "False") {
      return;
    }
    return response;
  }

  async function loadCategory(key) {
    if (!spreadsheet || detailsLoaded[key]) {
      return;
    }
    detailsLoaded[key] = true;
    const { sheet, omdbType, store } = categories[key];
    const items = spreadsheet.sheets[sheet].rows
      // first row is the title, ignore it
      .slice(1)
      .filter((row) => row.cells[0])
      .map(getItemFromRow)
      .sort((a, b) => {
        // sort from high to low
        return b.rating - a.rating;
      });
    store.set(items);

    for (const [index, item] of items.entries()) {
      const details = await getDetails(item, omdbType);
      if (details) {
        store.update((list) => {
          list[index].details = details;
          return list;
        });
      }
    }
  }

  function selectCategory(key) {
    category = key;
    const url = new URL(window.location);
    if (key === "shows") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", key);
    }
    url.hash = "";
    history.replaceState(null, "", url);
    loadCategory(key);
  }

  onMount(async () => {
    spreadsheet = await fetch(
      `${SHEETS_API_URL}/spreadsheets/${showsSSId}`,
    ).then((r) => r.json());
    loadCategory(category);
  });
</script>

<div class="container">
  <div class="user">
    {#if $user.profile}
      <button
        class="uk-button uk-button-default"
        type="button"
        on:click={logout}
      >
        Logout
      </button>
    {:else}
      <button
        class="uk-button uk-button-default"
        type="button"
        on:click={login}
      >
        Login
      </button>
    {/if}
  </div>
  <ul class="uk-subnav uk-subnav-pill">
    {#each Object.entries(categories) as [key, { label }]}
      <li class:uk-active={category === key}>
        <a
          href="?type={key}"
          on:click|preventDefault={() => selectCategory(key)}
        >
          {label}
        </a>
      </li>
    {/each}
  </ul>
  <table class="uk-table uk-table-striped">
    <thead>
      <tr>
        <th>{categories[category].label}</th>
        <th>Plot</th>
        <th>Rating</th>
      </tr>
    </thead>
    <tbody>
      {#each $list as show}
        <tr>
          <td class="show">
            <a href="#{show.slug}">
              {#if show.details && show.details.Poster}
                <img src={show.details.Poster} alt="Poster for {show.title}" />
              {/if}
              {show.title}
            </a>
          </td>
          <td class="plot">
            {#if show.details && show.details.Plot}{show.details.Plot}{/if}
          </td>
          <td class="rating">
            {#if show.details && show.details.Ratings && show.details.Ratings.length}
              <div>IMDB: {show.details.Ratings[0].Value}</div>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .container {
    margin: 2em auto;
    width: 95%;
  }
  .user {
    display: none;
  }
  .show {
    font-size: 1.15em;
    min-height: 11.25rem; /* set height to prevent layout shifts when image loads */
  }
  .plot {
    font-size: 0.9em;
  }
  .show img {
    max-width: 7em;
    padding-right: 1em;
    float: left;
    margin-bottom: 0.5em;
  }
  @media (min-width: 48em) {
    .container {
      width: 80%;
    }
    .show img {
      padding-right: 2em;
    }
  }
</style>

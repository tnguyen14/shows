<script>
  import { onMount } from "svelte";
  import { shows, user } from "./stores.js";
  import { getSession, deleteSession, createAuth } from "@tridnguyen/auth";

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

  function getShowFromRow(row) {
    return {
      title: row.cells[0],
      rating: row.cells[1],
    };
  }

  async function getShowDetails(title) {
    const response = await fetch(
      `${THIRDPARTY_API_URL}/omdb?type=series&title=${encodeURIComponent(
        title
      )}`
    ).then((r) => r.json());
    if (response.Response == "False") {
      return;
    }
    return response;
  }

  onMount(async () => {
    const resp = await fetch(`${SHEETS_API_URL}/${showsSSId}`).then((r) =>
      r.json()
    );
    // first row is the title, ignore it
    shows.update((n) =>
      n
        .concat(resp.sheets[0].rows.slice(1).map(getShowFromRow))
        .sort((showA, showB) => {
          // sort from high to low
          return showB.rating - showA.rating;
        })
    );

    for (const [index, show] of $shows.entries()) {
      let details = await getShowDetails(show.title);
      if (details) {
        shows.update((n) => {
          n[index].details = details;
          return n;
        });
      }
    }
  });
</script>

<div class="container">
  <div>
    {#if $user.profile}
      <button
        class="uk-button uk-button-default"
        type="button"
        on:click={logout}>
        Logout
      </button>
    {:else}
      <button
        class="uk-button uk-button-default"
        type="button"
        on:click={login}>
        Login
      </button>
    {/if}
  </div>
  <table class="uk-table uk-table-striped">
    <thead>
      <th>Shows</th>
      <th>Plot</th>
      <th>Rating</th>
    </thead>
    <tbody>
      {#each $shows as show}
        <tr>
          <td class="show">
            {#if show.details && show.details.Poster}
              <img src={show.details.Poster} alt="Poster for {show.title}" />
            {/if}
            {show.title}
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
  .show {
    font-size: 1.2em;
  }
  .plot {
    font-size: 0.9em;
  }
  .show img {
    max-width: 7em;
    padding-right: 1em;
    float: left;
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

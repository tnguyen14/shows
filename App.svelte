<script>
  import { onMount } from 'svelte';
  import { shows } from './stores.js';

  const showsSSId = '1t9m4G2uujVZhq8VCrw5VQhxCjT9IVXEeV2SspyhB6cU';

  function getShowFromRow(row) {
    return {
      title: row.cells[0],
      rating: row.cells[1]
    }
  }

  async function getShowDetails(title) {
    const response = await fetch(`https://omdbapi.com/?apikey=1bc0d27b&type=series&t=${encodeURIComponent(title)}`).then(r => r.json())
    if (response.Response == "False") {
      return;
    }
    return response;
  }

  onMount(async () => {
    const resp = await fetch(`${API_URL}/${showsSSId}`).then(r => r.json())
    // first row is the title, ignore it
    shows.update(n => n.concat(resp.sheets[0].rowData.slice(1).map(getShowFromRow)).sort((showA, showB) => {
      // sort from high to low
      return showB.rating - showA.rating;
    }))

    for (const [index, show] of $shows.entries()) {
      let details = await getShowDetails(show.title);
      if (details) {
        shows.update(n => {
          n[index].details = details;
          return n;
        })
      }
    }
  });
</script>

<div class="container">
  <div>
    <a class="uk-button uk-button-default"
       href="https://docs.google.com/spreadsheets/d/{showsSSId}">
      Edit
    </a>
  </div>
  <table class="uk-table uk-table-striped">
    <thead>
      <th>Shows</th>
      <th>Rating</th>
    </thead>
    <tbody>
      {#each $shows as show}
        <tr>
          <td>
            {#if show.details && show.details.Poster}
              <img src={show.details.Poster} alt="Poster for {show.title}">
            {/if}
            {show.title}
          </td>
          <td>
            <div class="personal-rating">{show.rating}</div>
            {#if show.details && show.details.Ratings}
              {#if !show.details.Ratings}
                {show.details}
              {/if}
              <div>(IMDB: {show.details.Ratings[0].Value})</div>
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
    width: 90%;
  }
  td img {
    max-width: 7em;
    padding-right: 2em;
  }
</style>

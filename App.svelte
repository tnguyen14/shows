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

  onMount(async () => {
    const resp = await fetch(`${API_URL}/${showsSSId}`).then(r => r.json())
    // first row is the title, ignore it
    shows.update(n => n.concat(resp.sheets[0].rowData.slice(1).map(getShowFromRow)).sort((showA, showB) => {
      // sort from high to low
      return showB.rating - showA.rating;
    }))
  });
</script>

<table class="uk-table uk-table-striped">
  <thead>
    <th>Shows</th>
    <th>Rating</th>
  </thead>
  <tbody>
    {#each $shows as show}
      <tr>
        <td>{show.title}</td>
        <td>{show.rating}</td>
      </tr>
    {/each}
  </tbody>
</table>

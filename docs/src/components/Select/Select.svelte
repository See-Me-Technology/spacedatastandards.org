<script>
  import { onMount } from "svelte";
  import {
    IDLDocument,
    manifest,
    IDLEditorContents,
    loadFile
  } from "../../stores/Files.js";
  import path from "path-browserify";
  export let loaded;

  export let toggleMenu;

  const clearLocalData = () => {
    if (confirm("clear data")) {
      localStorage.clear();
      $IDLDocument = "";
      $IDLEditorContents = "";
    }
  };
  onMount(() => {
    loaded = true;
  });
</script>

<style>
  container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    grid-gap: 20px;
    padding: 20px;
  }
  :root {
    --border-radius: 2em 17em;
  }
  .docButton {
    position: relative;
    color: #eee;
    font-size: var(--font-size-btn);
    font-weight: 300;
    min-width: 200px;
    padding: 8px;
    margin: 5px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1.5px #6c9ec4 outset;
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);

    background: var(--button-gradient);
    text-shadow: 1px 1px #666;
    cursor: pointer;
  }
  .docButton .text {
    z-index: 2;
  }
  .docButton::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    transition: opacity 0.2s linear;
    opacity: 0;
    background-image: linear-gradient(
      to right,
      var(--celestrak-blue) 0%,
      #3dabff 50%,
      var(--celestrak-blue) 100%
    );
  }
  .docButton:hover::before {
    opacity: 1;
  }
  h1,
  h2 {
    font-size: calc(2rem + 0.5 * ((100vw - 50rem) / 120));
    text-align: center;
    color: #000;
    font-weight: 200;
    font-family: var(--font-family);
  }
  h2 {
    font-size: calc(2rem + 0.5 * ((100vw - 50rem) / 120));
  }
  h1 a {
    text-decoration: none;
    color: var(--celestrak-blue);
    border-bottom: 0.5px var(--celestrak-blue) solid;
  }
  #footer {
    display: flex;
    align-content: center;
    justify-content: flex-end;
    padding: 5px;
    position: fixed;
    bottom: 0px;
    width: 100vw;
    z-index: 100;
  }
  #footer button {
    background: var(--celestrak-blue);
    border: 0px;
    color: white;
    padding: 10px;
  }
</style>

<div>
  <h2>CLICK TO LOAD</h2>
  <h2>
    <a
      style="text-decoration:none"
      href="https://google.github.io/flatbuffers/md__schemas.html"
      target="_new">
      INTERFACE DEFINITION LANGUAGE (IDL) FILE
    </a>
  </h2>
  <container>
    {#each $manifest.files.sort((a, b) => {
      return a.filename > b.filename ? -1 : 1;
    }) as mfile}
      <div class="docButton">
        <div
          class="text"
          on:click={e => {
            loaded = false;
            loadFile(mfile.filename, $manifest, true);
            window.location.hash = '/idl';
            toggleMenu(false);
          }}>
          {mfile.title}
          <br />
          {mfile.filename.match(/\w{1,}/)}
        </div>
      </div>
    {/each}
  </container>
  <div id="footer">
    <button
      on:click={() => {
        clearLocalData();
      }}>
      Click to Clear Local Data
    </button>
  </div>
</div>

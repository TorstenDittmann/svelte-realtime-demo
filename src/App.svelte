<script>
  import Appwrite from "appwrite";
  import { onMount } from "svelte";

  export let endpoint, endpointWs, project, collection;

  const sdk = new Appwrite();
  sdk.setEndpoint(`http://${endpoint}`).setProject(project);

  onMount(async () => {
    const response = await sdk.database.listDocuments(collection);
    todoList = response.documents;
  });

  const socket = new WebSocket(
    `ws://${endpointWs}/realtime?project=${project}&channels[]=collections.${collection}.documents`
  );

  // Listen for messages
  socket.addEventListener("message", (e) => {
    const message = JSON.parse(e.data);
    if (
      message.channels &&
      message.channels.some((c) => c === `collections.${collection}.documents`)
    ) {
      switch (message.event) {
        case "database.documents.create":
          todoList = [...todoList, message.payload];
          break;
        case "database.documents.update":
          let changed = false;
          todoList = todoList.map((task) => {
            if (task.$id === message.payload.$id) {
              task = message.payload;
              changed = true;
            }
            return task;
          });
          if (!changed) {
            todoList = [...todoList, message.payload];
          }
          break;

        case "database.documents.delete":
          todoList = todoList.filter(task => task.$id !== message.payload.$id);
          break;
      }
    }
  });

  let newItem = "";

  let todoList = [];

  const addToList = async () => {
    await sdk.database.createDocument(
      collection,
      {
        text: newItem,
      },
      ["*"],
      ["*"]
    );
    newItem = "";
  };

  const removeFromList = async (id) => {
    await sdk.database.deleteDocument(collection, id);
  };

  let user = "";
  let pass = "";
  const login = async () => {
    sdk.account.createSession(user, pass);
  };
  const register = async () => {
    sdk.account.create(user, pass);
  };
</script>

<input bind:value={newItem} type="text" placeholder="new todo item.." />
<button on:click={addToList}>Add</button>

<br />
{#each todoList as item}
  <input bind:checked={item.status} type="checkbox" />
  <span class:checked={item.status}>{item.text}</span>
  <span on:click={() => removeFromList(item.$id)}>❌</span>
  <br />
{/each}
<hr />
<input type="email" bind:value={user} placeholder="email" />
<input type="password" bind:value={pass} placeholder="password" />
<button on:click={login}>login</button>
<button on:click={register}>register</button>

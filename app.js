function proxied(url) {
  return url; // NO PROXY — direct HTTP allowed on InfinityFree
}

let state = {
  baseServer: "",
  username: "",
  password: "",
  categories: [],
  channels: [],
  activeCategoryId: "all"
};

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("login-form");
  const statusEl = document.getElementById("status");

  const categoryList = document.getElementById("category-list");
  const channelList = document.getElementById("channel-list");
  const player = document.getElementById("player");
  const embedBox = document.getElementById("embedCode");
  const copyBtn = document.getElementById("copyEmbed");

  const fullscreenBtn = document.getElementById("fullscreenBtn");

  fullscreenBtn.onclick = () => {
    if (player.requestFullscreen) player.requestFullscreen();
  };

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(embedBox.value);
    alert("Embed code copied!");
  };

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const server = document.getElementById("serverUrl").value.trim();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!server || !user || !pass) {
      statusEl.textContent = "Missing fields";
      return;
    }

    state.baseServer = server;
    state.username = user;
    state.password = pass;

    statusEl.textContent = "Loading...";

    try {
      const loginUrl = `${server}/player_api.php?username=${user}&password=${pass}`;
      const loginResp = await fetch(proxied(loginUrl));
      const loginData = await loginResp.json();

      if (!loginData.user_info || loginData.user_info.status !== "Active") {
        statusEl.textContent = "Login failed";
        return;
      }

      const catUrl = `${server}/player_api.php?username=${user}&password=${pass}&action=get_live_categories`;
      const chUrl  = `${server}/player_api.php?username=${user}&password=${pass}&action=get_live_streams`;

      const catResp = await fetch(proxied(catUrl));
      const chResp  = await fetch(proxied(chUrl));

      state.categories = await catResp.json();
      state.channels   = await chResp.json();

      statusEl.textContent = "Loaded";

      renderCategories();
      renderChannels();

    } catch (err) {
      statusEl.textContent = "Server error";
      console.log(err);
    }

  });

  function renderCategories() {
    categoryList.innerHTML = "";

    const all = document.createElement("div");
    all.textContent = "All";
    all.onclick = () => {
      state.activeCategoryId = "all";
      renderChannels();
    };
    categoryList.appendChild(all);

    state.categories.forEach(cat => {
      const el = document.createElement("div");
      el.textContent = cat.category_name;
      el.onclick = () => {
        state.activeCategoryId = cat.category_id;
        renderChannels();
      };
      categoryList.appendChild(el);
    });
  }

  function renderChannels() {
    channelList.innerHTML = "";

    const filtered = state.activeCategoryId === "all"
      ? state.channels
      : state.channels.filter(c => c.category_id == state.activeCategoryId);

    filtered.forEach(ch => {
      const el = document.createElement("div");
      el.textContent = ch.name;

      el.onclick = () => playChannel(ch);

      channelList.appendChild(el);
    });
  }

  function playChannel(ch) {
    const raw = `${state.baseServer}/live/${state.username}/${state.password}/${ch.stream_id}.m3u8`;
    player.src = raw;

    embedBox.value =
`<iframe src="${raw}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
  }

});

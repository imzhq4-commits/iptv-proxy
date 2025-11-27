let state = {
  baseServer: "",
  username: "",
  password: "",
  categories: [],
  channels: [],
  activeCategoryId: "all"
};

function cleanUrl(url) {
  return url.replace(/\/+$/, "");
}

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("login-form");
  const statusEl = document.getElementById("status");
  const categoryRow = document.getElementById("category-row");
  const channelGrid = document.getElementById("channel-grid");
  const currentTitle = document.getElementById("current-title");
  const player = document.getElementById("player");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const server = cleanUrl(document.getElementById("serverUrl").value);
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    state.baseServer = server;
    state.username = user;
    state.password = pass;

    setStatus("Logging in...");

    try {
      const loginUrl = `${server}/player_api.php?username=${user}&password=${pass}`;
      const loginResp = await fetch(loginUrl);
      const loginData = await loginResp.json();

      if (!loginData.user_info || loginData.user_info.status !== "Active") {
        return setStatus("Login failed", true);
      }

      setStatus("Loading categories...");
      const catUrl = `${server}/player_api.php?username=${user}&password=${pass}&action=get_live_categories`;
      const catResp = await fetch(catUrl);
      state.categories = await catResp.json();

      setStatus("Loading channels...");
      const chUrl = `${server}/player_api.php?username=${user}&password=${pass}&action=get_live_streams`;
      const chResp = await fetch(chUrl);
      state.channels = await chResp.json();

      setStatus("Loaded");
      renderCategories();
      renderChannels();

    } catch (err) {
      console.log(err);
      setStatus("Server error", true);
    }
  });

  function setStatus(msg, err = false) {
    statusEl.textContent = msg;
    statusEl.style.color = err ? "red" : "white";
  }

  function renderCategories() {
    categoryRow.innerHTML = "";

    const all = document.createElement("div");
    all.textContent = "All";
    all.classList.add("category-pill", "active");
    all.onclick = () => {
      state.activeCategoryId = "all";
      renderCategories();
      renderChannels();
    };
    categoryRow.appendChild(all);

    state.categories.forEach(cat => {
      const el = document.createElement("div");
      el.textContent = cat.category_name;
      el.classList.add("category-pill");
      el.onclick = () => {
        state.activeCategoryId = cat.category_id;
        renderCategories();
        renderChannels();
      };
      if (state.activeCategoryId == cat.category_id) el.classList.add("active");
      categoryRow.appendChild(el);
    });
  }

  function renderChannels() {
    channelGrid.innerHTML = "";
    const filtered =
      state.activeCategoryId === "all"
        ? state.channels
        : state.channels.filter(c => c.category_id == state.activeCategoryId);

    filtered.forEach(ch => {
      const card = document.createElement("div");
      card.classList.add("channel-card");
      card.innerHTML = `<div>${ch.name}</div>`;
      card.onclick = () => playChannel(ch);
      channelGrid.appendChild(card);
    });
  }

  function playChannel(ch) {
    currentTitle.textContent = ch.name;

    const url = `${state.baseServer}/live/${state.username}/${state.password}/${ch.stream_id}.m3u8`;

    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = url;
      player.play();
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(player);
      hls.on(Hls.Events.MANIFEST_PARSED, () => player.play());
    }
  }

});

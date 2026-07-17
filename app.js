const state = { archive: null, selected: null };

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[char]);

const safeUrl = (value = "") => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
};

const weekday = (date) => ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(`${date}T12:00:00+08:00`).getDay()];
const humanDate = (date) => {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日${weekday(date)}`;
};

function adjacentDates(date) {
  const dates = state.archive.dates;
  return {
    older: dates.find((item) => item < date),
    newer: [...dates].reverse().find((item) => item > date)
  };
}

function insightColumn(title, icon, items = []) {
  const list = items.map((item, index) => `
    <li><span class="insight-index">${index + 1}</span><div>
      <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>
    </div></li>`).join("");
  return `<section class="panel insight-panel"><div class="panel-title"><span class="star">${icon}</span>${title}</div><ol>${list}</ol></section>`;
}

function render() {
  const date = state.selected;
  const brief = state.archive.briefs[date];
  const latest = state.archive.dates[0];
  const oldest = state.archive.dates[state.archive.dates.length - 1];
  const { older, newer } = adjacentDates(date);
  document.querySelector("#display-date").textContent = humanDate(date);
  document.querySelector("#date-picker").value = date;
  document.querySelector("#date-picker").min = oldest;
  document.querySelector("#date-picker").max = latest;
  document.querySelector("#older").disabled = !older;
  document.querySelector("#newer").disabled = !newer;
  document.querySelector("#latest").disabled = date === latest;
  document.querySelector("#updated").textContent = brief?.generated_at
    ? `${new Date(brief.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })} 更新`
    : "暂无记录";

  if (!brief) {
    document.querySelector("#content").innerHTML = `<section class="panel empty-state"><div class="empty-date">${humanDate(date)}</div><h2>当日暂无资讯记录</h2><p>日期控件仍然可用，你可以继续选择更早或更新的日期。</p></section>`;
    return;
  }

  const rows = (brief.top6 || []).map((item, index) => `
    <article class="news-row">
      <div class="number">${index + 1}</div>
      <div class="headline"><a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
        <span class="tag ${item.region === "international" ? "international" : "domestic"}">${item.region === "international" ? "国际热点" : "国内热点"}</span>
      </div>
      <div class="source">${escapeHtml(item.source)}</div><p class="summary">${escapeHtml(item.summary)}</p>
    </article>`).join("");

  document.querySelector("#content").innerHTML = `
    <section class="panel must-read"><div class="panel-title"><span class="star">☆</span>今日必看｜国际热点 + 国内热点</div>
      <div class="news-head"><span>标题</span><span>来源</span><span>摘要</span></div><div class="news-list">${rows}</div>
    </section>
    <section class="insights-grid">${insightColumn("行业趋势判断", "↗", brief.industry_trends)}${insightColumn("资本动态", "◎", brief.capital_moves)}</section>`;
}

async function start() {
  try {
    const response = await fetch(`data/index.json?v=${Date.now()}`);
    if (!response.ok) throw new Error("数据加载失败");
    state.archive = await response.json();
    state.selected = state.archive.dates[0];
    render();
  } catch (error) {
    document.querySelector("#content").innerHTML = `<section class="panel empty-state"><h2>看板暂时无法加载</h2><p>${escapeHtml(error.message)}</p></section>`;
  }
}

document.querySelector("#date-picker").addEventListener("change", (event) => { if (event.target.value) { state.selected = event.target.value; render(); } });
document.querySelector("#older").addEventListener("click", () => { const value = adjacentDates(state.selected).older; if (value) { state.selected = value; render(); } });
document.querySelector("#newer").addEventListener("click", () => { const value = adjacentDates(state.selected).newer; if (value) { state.selected = value; render(); } });
document.querySelector("#latest").addEventListener("click", () => { state.selected = state.archive.dates[0]; render(); });
start();

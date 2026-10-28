import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "../chatgpt-auth";
import "./styles.css";

export const dynamic = "force-dynamic";

type TrafficRow = {
  day: string;
  views: number;
  unique_visitors: number;
  enquiries: number;
  orders: number;
};

const OWNER_EMAIL = "nikolaicekov10@gmail.com";

export default async function AnalyticsPage() {
  const user = await requireChatGPTUser("/analytics");
  if (user.email.toLowerCase() !== OWNER_EMAIL) {
    return <main className="analytics-shell"><h1>Нямате достъп до тази страница.</h1><a href="/">Към сайта</a></main>;
  }

  const result = await env.DB.prepare(
    "SELECT day, views, unique_visitors, enquiries, orders FROM daily_traffic ORDER BY day DESC LIMIT 31",
  ).all<TrafficRow>();
  const rows = result.results ?? [];
  const totals = rows.reduce((sum, row) => ({
    views: sum.views + row.views,
    visitors: sum.visitors + row.unique_visitors,
    enquiries: sum.enquiries + row.enquiries,
    orders: sum.orders + row.orders,
  }), { views: 0, visitors: 0, enquiries: 0, orders: 0 });

  return <main className="analytics-shell">
    <header><div><p>Nikky’S</p><h1>Посещаемост на сайта</h1></div><a href="/">Към магазина</a></header>
    <section className="summary">
      <article><span>Преглеждания</span><strong>{totals.views}</strong></article>
      <article><span>Посетители</span><strong>{totals.visitors}</strong></article>
      <article><span>Запитвания</span><strong>{totals.enquiries}</strong></article>
      <article><span>Поръчки</span><strong>{totals.orders}</strong></article>
    </section>
    <section className="traffic-table">
      <h2>Последните 31 дни</h2>
      {rows.length === 0 ? <p>Все още няма събрани данни.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Дата</th><th>Преглеждания</th><th>Посетители</th><th>Запитвания</th><th>Поръчки</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.day}><td>{new Intl.DateTimeFormat("bg-BG").format(new Date(`${row.day}T12:00:00Z`))}</td><td>{row.views}</td><td>{row.unique_visitors}</td><td>{row.enquiries}</td><td>{row.orders}</td></tr>)}</tbody>
      </table></div>}
    </section>
    <p className="privacy-note">Данните са обобщени по дни и не съдържат имена или лични данни на посетителите.</p>
  </main>;
}

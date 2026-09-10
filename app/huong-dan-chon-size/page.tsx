import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';

const rows = [
  ['S', '82–88', '66–72', '88–94'],
  ['M', '89–95', '73–79', '95–101'],
  ['L', '96–102', '80–86', '102–108'],
  ['XL', '103–110', '87–94', '109–116'],
  ['XXL', '111–118', '95–102', '117–124'],
];
export default function SizeGuidePage() {
  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />
      <section className="bg-black px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-[1100px]">
          <p className="section-kicker text-[#dfff00]">MOVA / Size guide</p>
          <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.07em] sm:text-7xl">
            Chọn size phù hợp
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Bảng dưới đây là dữ liệu mẫu cho đồ án và cần được thay bằng số đo
            đã xác minh trước khi kinh doanh thật.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8 lg:px-0 lg:py-24">
        <div className="overflow-x-auto rounded-[20px] border border-black/10 bg-white shadow-sm">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-[#dfff00]">
              <tr>
                {[
                  'Size',
                  'Vòng ngực (cm)',
                  'Vòng eo (cm)',
                  'Vòng mông (cm)',
                ].map((h) => (
                  <th key={h} className="px-6 py-4 font-black">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td
                      key={cell}
                      className={`px-6 py-4 ${i === 0 ? 'font-black' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['01', 'Ngực', 'Đo vòng qua phần đầy nhất, giữ thước ngang.'],
            ['02', 'Eo', 'Đo tại phần nhỏ nhất của eo, không siết thước.'],
            ['03', 'Mông', 'Đo vòng qua phần đầy nhất khi đứng thẳng.'],
          ].map(([n, t, c]) => (
            <div
              key={n}
              className="rounded-[20px] border border-black/10 bg-white p-6"
            >
              <span className="text-xs font-black text-neutral-300">/{n}</span>
              <h2 className="mt-6 text-xl font-black">{t}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{c}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 rounded-2xl bg-black p-5 text-sm leading-6 text-white">
          <b className="text-[#dfff00]">Set thể thao:</b> chọn một size chung
          cho cả bộ; hệ thống không tách size áo và quần.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}

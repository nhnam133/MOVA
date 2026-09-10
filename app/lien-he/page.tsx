import { MapPin } from 'lucide-react';
import { ContactForm } from '@/components/store/contact-form';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />
      <section className="bg-black px-4 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1384px]">
          <p className="section-kicker text-[#dfff00]">MOVA / Hỗ trợ</p>
          <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.07em] sm:text-7xl">
            Liên hệ
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Gửi câu hỏi về sản phẩm, đơn hàng hoặc quy trình đổi size. Thông tin
            liên hệ công khai của MOVA sẽ được cập nhật sau.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1384px] gap-6 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:px-0 lg:py-24">
        <ContactForm />
        <div className="overflow-hidden rounded-[22px] border border-black/10 bg-white">
          <div className="p-6 sm:p-8">
            <MapPin className="h-6 w-6" />
            <h2 className="mt-5 text-2xl font-black">
              Địa điểm minh họa đồ án
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              UTH cơ sở 1, số 2 Võ Oanh, phường Thạnh Mỹ Tây, TP.HCM. Đây không
              phải cửa hàng hoặc thông tin kinh doanh của MOVA.
            </p>
          </div>
          <iframe
            title="Bản đồ minh họa UTH cơ sở 1"
            src="https://www.google.com/maps?q=UTH%20c%C6%A1%20s%E1%BB%9F%201%20s%E1%BB%91%202%20V%C3%B5%20Oanh%20TPHCM&output=embed"
            className="h-[360px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

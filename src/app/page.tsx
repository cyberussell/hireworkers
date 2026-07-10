import Image from "next/image";
import { HeroCta } from "@/components/home/hero-cta";
import { PhoneMockup } from "@/components/home/phone-mockup";
import { ConversationPreview } from "@/components/home/conversation-preview";
import { HomeAuthRedirect } from "@/components/home/home-auth-redirect";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
      <HomeAuthRedirect />
      <div className="flex w-full flex-col items-center gap-6 text-center lg:w-[45%] lg:items-start lg:text-left">
        <Image
          src="/hireworker-logo.png"
          alt=""
          width={56}
          height={56}
          className="size-12 lg:size-14"
          priority
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Ano ang alam mong gawin?
          </h1>
          <p className="max-w-md text-balance text-base text-muted-foreground sm:text-lg">
            Makipag-usap lang sa AI sa Tagalog, Taglish, o English.
            Tutulungan ka nitong gawin ang iyong professional profile base sa
            iyong kakayahan. No need ng bio-data or resume.
          </p>
        </div>

        <HeroCta />
      </div>

      <div
        id="paano-gumagana"
        className="flex w-full scroll-mt-24 justify-center lg:w-[55%]"
      >
        <PhoneMockup>
          <ConversationPreview />
        </PhoneMockup>
      </div>
    </div>
  );
}

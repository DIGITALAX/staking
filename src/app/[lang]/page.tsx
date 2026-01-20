import { getDictionary } from "./dictionaries";
import { tParams } from "./layout";
import { Metadata } from "next";
import { LOCALES } from "@/app/lib/constants";
import Entry from "../components/Common/modules/Entry";

export async function generateMetadata({
  params,
}: {
  params: tParams;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `https://staking.digitalax.xyz/${lang}/`;

  return {
    title: {
      default: "Material Staking | DIGITALAX",
      template: "%s | DIGITALAX",
    },
    description: "DIGITALAX staking pools.",
    alternates: {
      canonical,
      languages: LOCALES.reduce(
        (acc, item) => {
          acc[item] = `https://staking.digitalax.xyz/${item}/`;
          return acc;
        },
        {} as { [key: string]: string },
      ),
    },
    openGraph: {
      title: "Staking",
      description: "DIGITALAX staking pools.",
      url: canonical,
      siteName: "Staking",
      images: [
        {
          url: "https://staking.digitalax.xyz/opengraph-image.png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Staking",
      description: "DIGITALAX staking pools.",
      site: "@digitalax_",
      creator: "@digitalax_",
      images: ["https://staking.digitalax.xyz/opengraph-image.png"],
    },
  };
}

export default async function IndexPage({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <Entry dict={dict} />;
}

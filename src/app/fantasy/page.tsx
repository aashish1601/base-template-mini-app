import { Metadata } from "next";
import FantasyApp from "./FantasyApp";
import { APP_NAME } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Influencer Fantasy League - ${APP_NAME}`,
  description: "Draft creators, earn points, win prizes",
};

export default function FantasyPage() {
  return <FantasyApp />;
}


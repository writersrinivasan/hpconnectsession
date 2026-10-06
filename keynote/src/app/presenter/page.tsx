import type { Metadata } from "next";
import { PresenterClient } from "../ClientOnly";

export const metadata: Metadata = { title: "Presenter View · One Yoto Keynote" };

export default function Page() {
  return <PresenterClient />;
}

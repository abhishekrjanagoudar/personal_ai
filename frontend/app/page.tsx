"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { SelectionScreen } from "@/components/selection/SelectionScreen";
import { AssistantMode } from "@/types";

export default function Home() {
  const { token, setMode } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const handleSelect = (mode: AssistantMode) => {
    setMode(mode);
    router.push("/login");
  };

  return <SelectionScreen onSelect={handleSelect} />;
}

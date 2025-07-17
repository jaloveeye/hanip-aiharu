import { useState } from "react";

export default function usePopup() {
  const [popup, setPopup] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const showPopup = (message: string) => setPopup({ open: true, message });
  const closePopup = () => setPopup({ open: false, message: "" });
  return { popup, showPopup, closePopup };
}

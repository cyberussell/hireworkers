"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/google-icon";
import { SignInDialog } from "@/components/auth/sign-in-dialog";

export function HeroCta() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [defaultMode, setDefaultMode] = useState<"sign_in" | "sign_up">(
    "sign_in"
  );

  function openDialog(mode: "sign_in" | "sign_up") {
    setDefaultMode(mode);
    setSignInOpen(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="flex flex-col items-center gap-3 lg:items-start"
    >
      <Button
        size="lg"
        className="h-11 px-6 text-base"
        onClick={() => openDialog("sign_in")}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <button
        type="button"
        onClick={() => openDialog("sign_up")}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Walang Google account? Mag-sign up gamit ang email
      </button>
      <a
        href="#paano-gumagana"
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Paano ito gumagana?
      </a>
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        next="/work"
        title="Simulan ang iyong profile"
        description="Gamitin ang Google account mo, o mag-sign in gamit ang email."
        defaultMode={defaultMode}
      />
    </motion.div>
  );
}

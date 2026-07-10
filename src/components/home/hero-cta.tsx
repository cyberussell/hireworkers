"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/google-icon";
import { SignInDialog } from "@/components/auth/sign-in-dialog";

export function HeroCta() {
  const [signInOpen, setSignInOpen] = useState(false);

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
        onClick={() => setSignInOpen(true)}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
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
      />
    </motion.div>
  );
}

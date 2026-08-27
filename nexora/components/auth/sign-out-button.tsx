"use client";

import { signOut } from "next-auth/react";
import { forwardRef } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type SignOutButtonProps = Omit<ButtonProps, "onClick"> & {
  callbackUrl?: string;
};

export const SignOutButton = forwardRef<HTMLButtonElement, SignOutButtonProps>(
  ({ callbackUrl = "/", variant = "ghost", children, ...rest }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      onClick={() => signOut({ callbackUrl })}
      {...rest}
    >
      {children ?? "Sign out"}
    </Button>
  )
);
SignOutButton.displayName = "SignOutButton";

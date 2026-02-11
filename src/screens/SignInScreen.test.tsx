import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SignInScreen } from "./SignInScreen";

describe("AUTH-1: Google OAuth Sign In/Sign Up", () => {
  it("renders sign-in screen with branding for unauthenticated users", () => {
    render(<SignInScreen onSignIn={() => {}} />);

    expect(screen.getByText("SplitEase")).toBeInTheDocument();
    expect(
      screen.getByText("Split expenses with roommates"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("initiates Google OAuth on button click", async () => {
    const onSignIn = vi.fn();
    const user = userEvent.setup();
    render(<SignInScreen onSignIn={onSignIn} />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    expect(onSignIn).toHaveBeenCalled();
  });
});

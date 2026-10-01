
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    const supabase = supabaseBrowser();

    const cleanEmail = email.trim().toLowerCase();

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (signInError) {
      if (
        signInError.code === "email_not_confirmed" ||
        signInError.message.toLowerCase().includes("email not confirmed")
      ) {
        router.push(
          `/verify-email?email=${encodeURIComponent(cleanEmail)}`
        );
        return;
      }

      setError(
        "Unable to sign in. Please check your email and password and try again."
      );
      return;
    }

    if (!data.user || !data.session) {
      setError("Your login could not be completed. Please try again.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  } catch (err) {
    console.error("Login error:", err);
    setError("Unable to sign in. Please try again.");
  } finally {
    setLoading(false);
  }
}
